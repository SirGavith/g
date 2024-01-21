import { Expression, ExpressionTypes } from "./Expressions"
import { parseExpr, LexerError } from "../../lexer/lexer"
import { Operators, operatorMapOprString } from "../operators"
import * as Console from 'glib/dist/Console'


export class OperationExpression extends Expression {
    override ExpressionType: ExpressionTypes.Operation = ExpressionTypes.Operation
    Operand: Expression
    Operator: Operators
    Operand2?: Expression

    constructor(operator: Operators, operand: Expression, operand2?: Expression) {
        super()
        this.Operator = operator
        this.Operand = operand
        this.Operand2 = operand2
    }

    override Log(indent = 0) {
        console.log(' '.repeat(indent) + `${Console.Cyan + ExpressionTypes[this.ExpressionType] + Console.Reset} ${operatorMapOprString.get(this.Operator)}:`)
        this.Operand.Log(indent + 1)
        this.Operand2?.Log(indent + 1)
    }
}