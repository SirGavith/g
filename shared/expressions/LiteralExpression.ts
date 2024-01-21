import { Expression, ExpressionTypes } from "./Expressions"
import { parseExpr, LexerError } from "../../lexer/lexer"
import * as Console from 'glib/dist/Console'

export class LiteralExpression extends Expression {
    override ExpressionType: ExpressionTypes.Literal = ExpressionTypes.Literal
    Value: number

    constructor(val: number) {
        super()
        this.Value = val
    }

    override Log(indent = 0) {
        console.log(' '.repeat(indent) + `${Console.Cyan + ExpressionTypes[this.ExpressionType]} ${Console.Yellow + this.Value + Console.Reset}`)
    }
}