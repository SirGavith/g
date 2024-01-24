import { Expression, ExpressionTypes } from "./Expressions"
import { parseExpr, LexerError } from "../../lexer/lexer"
import { Operators, binaryOperators, binarySetOperators, operatorMapOprString } from "../operators"
import * as Console from 'glib/dist/Console'
import { OperatorOverloadExpression } from "./OperatorOverloadExpression"
import { CompilerError } from "../../compiler/compiler"
import { VariableExpression } from "./VariableExpression"


export class OperationExpression extends Expression {
    override ExpressionType: ExpressionTypes.Operation = ExpressionTypes.Operation
    Operand: Expression
    Operator: Operators
    Operand2?: Expression

    OperatorOverload?:OperatorOverloadExpression

    constructor(operator: Operators, operand: Expression, operand2?: Expression) {
        super()
        this.Operator = operator
        this.Operand = operand
        this.Children.Push(this.Operand)
        if (operand2 !== undefined) {
            this.Operand2 = operand2
            this.Children.Push(this.Operand2)
        }
    }

    override Log(indent = 0) {
        console.log(' '.repeat(indent) + `${Console.Cyan + ExpressionTypes[this.ExpressionType] + Console.Reset} ${operatorMapOprString.get(this.Operator)}:`)
        this.Operand.Log(indent + 1)
        this.Operand2?.Log(indent + 1)
    }

    override getType(identifiers: Map<string, string>, validOperators: Map<string, OperatorOverloadExpression>) {
        const operandType = this.Operand.getType(identifiers, validOperators)
        const operand2Type = this.Operand2?.getType(identifiers, validOperators)

        if (binarySetOperators.has(this.Operator) &&
            this.Operand.ExpressionType !== ExpressionTypes.Variable)
                throw new CompilerError('set operators must have a variable on the left')

        const hashString = this.Operand2 ? `${this.Operator};${operandType},${operand2Type}` :
            `${this.Operator};${operandType}` 

        this.OperatorOverload = validOperators.get(hashString)
        if (this.OperatorOverload === undefined) {
            throw new CompilerError(`did not find overload for operation ${this.Operator} for (${operandType}, ${operand2Type}); Did you mean in include a library?`)
        }

        // console.log(`${operandType} ${operatorMapOprString.get(this.Operator)} ${operand2Type} => ${this.OperatorOverload.ReturnType}`)
        return this.OperatorOverload.ReturnType
    }

    override getAssembly(newVariableNameMap: Map<string, string>): string[] {
        if (this.OperatorOverload === undefined) throw new CompilerError('getting assembly without type coercion')



        if (this.Operand2 !== undefined) {

            if (binarySetOperators.has(this.Operator)) {
                return [
                    `// ${operatorMapOprString.get(this.Operator)}`,
                    ...this.Operand.getAssembly(newVariableNameMap),
                    `STA ${this.OperatorOverload.Parameters[0].AssemblyName}`,
                    ...this.Operand2.getAssembly(newVariableNameMap),
                    `STA ${this.OperatorOverload.Parameters[1].AssemblyName}`,
                    `JSR ${this.OperatorOverload.AssemblyName}`,
                    `STA ${(this.Operand as VariableExpression).Identifier}`,
                ]
            }
            return [
                `// ${operatorMapOprString.get(this.Operator)}`,
                ...this.Operand.getAssembly(newVariableNameMap),
                `STA ${this.OperatorOverload.Parameters[0].AssemblyName}`,
                ...this.Operand2.getAssembly(newVariableNameMap),
                `STA ${this.OperatorOverload.Parameters[1].AssemblyName}`,
                `JSR ${this.OperatorOverload.AssemblyName}`,
            ]
        }

        return [
            //UNTESTED
            ...this.Operand.getAssembly(newVariableNameMap),
            `STA ${this.OperatorOverload.Parameters[0].AssemblyName}`,

            `JSR ${this.OperatorOverload.AssemblyName}`,
            `STA ${(this.Operand as VariableExpression).Identifier}`,
        ]
    }
}