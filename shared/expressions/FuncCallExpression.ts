import { CompoundExpression, Expression, ExpressionTypes } from "../../lexer/expressions"
import { LexerError, forEachScopedExprOnDelim, isValidIdentifier, parseExpr } from "../../lexer/lexer"


export class FuncCallExpression extends Expression {
    override ExpressionType: ExpressionTypes.Func = ExpressionTypes.Func
    Identifier?: string
    Parameters: Expression[] = []

    constructor(expr?: string) {
        super()
        if (expr === undefined)
            throw new LexerError('could not find func body')

        this.Identifier = expr.slice(0, expr.indexOf('('))
        if (!isValidIdentifier(this.Identifier)) {
            throw new LexerError(`type '${this.Identifier}' is invalid`)
        }
        
        expr = expr.slice(this.Identifier.length).trim()
        if (!expr.startsWith('(') || !expr.endsWith(')'))
            throw new Error('function call must begin and end with parens')
        expr = expr.slice(1, -1)


        forEachScopedExprOnDelim(expr, ',', exp => {
            this.Parameters.push(parseExpr(exp))
        })
    }
}
