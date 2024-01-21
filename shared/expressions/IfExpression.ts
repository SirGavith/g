import { Expression, ExpressionTypes } from "./Expressions"
import { parseExpr, LexerError, forEachScopedExprOnDelim } from "../../lexer/lexer"

export class IfExpression extends Expression {
    override ExpressionType: ExpressionTypes.If = ExpressionTypes.If
    Condition?: Expression
    Body?: Expression
    ElseExpression?: Expression

    constructor(rest?: string) {
        super()
        if (rest === undefined)
            throw new LexerError('Could not find if body')
        if (rest.charAt(0) !== '(')
            throw new LexerError('if condition should have parens')

        forEachScopedExprOnDelim(rest, ',', (expr, i) => {
            this.Condition = parseExpr(expr)
            const elsePos = rest.indexOf('else', i)
            if (elsePos !== -1) {
                this.Body = parseExpr(rest.slice(i + 1, elsePos))
                this.ElseExpression = parseExpr(rest.slice(elsePos + 4))
            }
            else {
                this.Body = parseExpr(rest.slice(i + 1))
            }
            return true
        })


        if (!this.Condition) throw new LexerError('Could not find if condition ' + rest)
        if (!this.Body) throw new LexerError('Could not find if body ' + rest)
    }
}