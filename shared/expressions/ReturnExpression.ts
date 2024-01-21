import { Expression, ExpressionTypes } from "../../lexer/expressions"
import { LexerError, parseExpr } from "../../lexer/lexer"


export class ReturnExpression extends Expression {
    override ExpressionType: ExpressionTypes.Return = ExpressionTypes.Return
    Expression: Expression

    constructor(rest?: string) {
        super()
        if (rest === undefined)
            throw new LexerError('asm body appears to be empty')

        this.Expression = parseExpr(rest)
    }
}