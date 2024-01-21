import { Expression, ExpressionTypes } from "./Expressions"
import { parseExpr, LexerError, forEachScopedExprOnDelim } from "../../lexer/lexer"

export class WhileExpression extends Expression {
    override ExpressionType: ExpressionTypes.While = ExpressionTypes.While
    Condition?: Expression
    Body?: Expression

    constructor(rest?: string) {
        super()
        if (rest === undefined)
            throw new LexerError('Could not find while body')
        if (rest.charAt(0) !== '(')
            throw new LexerError('while condition should have parens')

        forEachScopedExprOnDelim(rest, ')', (_, i) => {
            this.Condition = parseExpr(rest.slice(1, i))
            this.Body = parseExpr(rest.slice(i + 1))
            return true
        })


        if (!this.Condition) throw new LexerError('Could not find while condition ' + rest)
        if (!this.Body) throw new LexerError('Could not find while body ' + rest)
    }
}