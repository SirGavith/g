import { CompoundExpression, Expression, ExpressionTypes } from "./Expressions"
import { LexerError, forEachScopedExprOnDelim, isValidIdentifier, parseExpr } from "../../lexer/lexer"
import * as Console from 'glib/dist/Console'


export class FuncCallExpression extends Expression {
    override ExpressionType: ExpressionTypes.FuncCall = ExpressionTypes.FuncCall
    Identifier: string
    Parameters: Expression[] = []

    constructor(expr?: string) {
        super()
        if (expr === undefined)
            throw new LexerError('could not find func body')

        this.Identifier = expr.slice(0, expr.indexOf('(')).trim()
        if (!isValidIdentifier(this.Identifier)) {
            throw new LexerError(`type '${this.Identifier}' is invalid`)
        }
        
        expr = expr.slice(this.Identifier.length).trim()
        if (!expr.startsWith('(') || !expr.endsWith(')'))
            throw new Error('function call must begin and end with parens')
        expr = expr.slice(1, -1).trim()


        forEachScopedExprOnDelim(expr, ',', exp => {
            this.Parameters.push(parseExpr(exp))
        })
    }

    override Log(indent = 0) {
        console.log(' '.repeat(indent) + `${Console.Cyan + ExpressionTypes[this.ExpressionType]} ${Console.Red + this.Identifier + Console.Reset} Params:`)
        this.Parameters.forEach(p => {
            p.Log(indent + 1)
        })
    }
}
