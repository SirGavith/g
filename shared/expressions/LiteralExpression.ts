import { Expression, ExpressionTypes } from "../../lexer/expressions"
import { parseExpr, LexerError } from "../../lexer/lexer"

export class LiteralExpression extends Expression {
    override ExpressionType: ExpressionTypes.Literal = ExpressionTypes.Literal
    Value?: number

    constructor(val: number) {
        super()
        this.Value = val
    }
}