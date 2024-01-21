import { Expression, ExpressionTypes } from "./Expressions"
import { parseExpr, LexerError, forEachScopedExprOnDelim } from "../../lexer/lexer"
import * as Console from 'glib/dist/Console'

export class WhileExpression extends Expression {
    override ExpressionType: ExpressionTypes.While = ExpressionTypes.While
    Condition: Expression
    Body: Expression

    constructor(rest?: string) {
        super()
        if (rest === undefined)
            throw new LexerError('Could not find while body')
        if (rest.charAt(0) !== '(')
            throw new LexerError('while condition should have parens')

        forEachScopedExprOnDelim(rest, ')', (_, i) => {
            this.Condition = parseExpr(rest.slice(1, i).trim())
            this.Body = parseExpr(rest.slice(i + 1).trim())
            return true
        })

        // @ts-ignore
        if (!this.Condition)
            throw new LexerError('Could not find while condition ' + rest)
        // @ts-ignore
        if (!this.Body)
            throw new LexerError('Could not find while body ' + rest)
    }

    override Log(indent = 0) {
        console.log(' '.repeat(indent) + `${Console.Cyan + ExpressionTypes[this.ExpressionType] + Console.Reset} Condition:`)
        this.Condition.Log(indent + 1)
        console.log(' '.repeat(indent) + `Body:`)
        this.Body.Log(indent + 1)
    }
}