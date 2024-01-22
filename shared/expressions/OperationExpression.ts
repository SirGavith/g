import { Expression, ExpressionTypes } from "./Expressions"
import { parseExpr, LexerError } from "../../lexer/lexer"
import { Operators, operatorMapOprString } from "../operators"
import * as Console from 'glib/dist/Console'
import { OperatorOverloadExpression } from "./OperatorOverloadExpression"
import { CompilerError } from "../../compiler/compiler"


export class OperationExpression extends Expression {
    override ExpressionType: ExpressionTypes.Operation = ExpressionTypes.Operation
    Operand: Expression
    Operator: Operators
    Operand2?: Expression

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

        const hashString = `${this.Operator};${operandType},${operand2Type}`
        const operator = validOperators.get(hashString)
        if (operator === undefined) {
            throw new CompilerError(`did not find overload for operation ${this.Operator} for (${operandType}, ${operand2Type})`)
        }
        return operator.ReturnType
    }
}