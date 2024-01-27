import { Expression, ExpressionTypes } from "./Expressions"
import { parseExpr, LexerError } from "../../lexer/lexer"
import { Operators, binaryOperators, binarySetOperators, operatorMapOprString } from "../operators"
import * as Console from 'glib/dist/Console'
import { OperatorOverloadExpression } from "./OperatorOverloadExpression"
import { CompilerError, recursionBody, recursionReturn } from "../../compiler/compiler"
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

    override traverse(recursionBody: recursionBody): recursionReturn {

        const operand1 = this.Operand.traverse(recursionBody)
        const operand2 = this.Operand2?.traverse(recursionBody)

        if (binarySetOperators.has(this.Operator) &&
            this.Operand.ExpressionType !== ExpressionTypes.Variable)
            throw new CompilerError('set operators must have a variable on the left')

        const hashString = this.Operand2 ? `${this.Operator};${operand1.ReturnType},${operand2?.ReturnType}` :
            `${this.Operator};${operand1.ReturnType}`

        this.OperatorOverload = recursionBody.OperatorOverloads.get(hashString)
        if (this.OperatorOverload === undefined) {
            throw new CompilerError(`did not find overload for operation ${this.Operator} for (${operand1.ReturnType}, ${operand2?.ReturnType}); Did you mean in include a library?`)
        }
        // console.log(`${operandType} ${operatorMapOprString.get(this.Operator)} ${operand2Type} => ${this.OperatorOverload.ReturnType}`)

        if (operand2 !== undefined) {

            if (binarySetOperators.has(this.Operator)) {
                return {
                    Assembly: [
                        `// ${operatorMapOprString.get(this.Operator)}`,
                        ...operand1.Assembly,
                        `STA ${this.OperatorOverload.Parameters[0].AssemblyName}`,
                        ...operand2.Assembly,
                        `STA ${this.OperatorOverload.Parameters[1].AssemblyName}`,
                        `JSR ${this.OperatorOverload.AssemblyName}`,
                        `STA ${(this.Operand as VariableExpression).Identifier}`,
                    ],
                    ReturnType: this.OperatorOverload.ReturnType
                }
                
            }
            return {
                Assembly: [
                    `// ${operatorMapOprString.get(this.Operator)}`,
                    ...operand1.Assembly,
                    `STA ${this.OperatorOverload.Parameters[0].AssemblyName}`,
                    ...operand2.Assembly,
                    `STA ${this.OperatorOverload.Parameters[1].AssemblyName}`,
                    `JSR ${this.OperatorOverload.AssemblyName}`,
                ],
                ReturnType: this.OperatorOverload.ReturnType
            }
        }

        return {
            Assembly: [
                //UNTESTED
                ...operand1.Assembly,
                `STA ${this.OperatorOverload.Parameters[0].AssemblyName}`,

                `JSR ${this.OperatorOverload.AssemblyName}`,
                `STA ${(this.Operand as VariableExpression).Identifier}`,
            ],
            ReturnType: this.OperatorOverload.ReturnType
        }
    }
}