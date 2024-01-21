import { Expression, ExpressionTypes } from "./Expressions"
import { LexerError, parseExpr } from "../../lexer/lexer"


export class ReturnExpression extends Expression {
    override ExpressionType: ExpressionTypes.Return = ExpressionTypes.Return
    Expression?: Expression

    constructor(rest?: string) {
        super()
        
        this.Expression = rest === undefined ? rest : parseExpr(rest)
    }
}