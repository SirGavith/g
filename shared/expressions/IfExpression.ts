import { Expression, ExpressionTypes } from "./Expressions"
import { parseExpr, LexerError, forEachScopedExprOnDelim } from "../../lexer/lexer"
import * as Console from 'glib/dist/Console'
import { nextArbitraryIdentifier, recursionBody, recursionReturn } from "../../compiler/compiler"

export class IfExpression extends Expression {
    override ExpressionType: ExpressionTypes.If = ExpressionTypes.If
    Condition: Expression
    Body: Expression
    ElseExpression?: Expression

    constructor(rest?: string) {
        super()
        if (rest === undefined)
            throw new LexerError('Could not find if body')
        if (rest.charAt(0) !== '(')
            throw new LexerError('if condition should have parens')

        forEachScopedExprOnDelim(rest, ')', (expr, i) => {
            this.Condition = parseExpr(expr.slice(1).trim())
            this.Children.Push(this.Condition)
            const elsePos = rest.indexOf('else', i)
            if (elsePos !== -1) {
                this.Body = parseExpr(rest.slice(i + 1, elsePos).trim())
                this.Children.Push(this.Body)
                this.ElseExpression = parseExpr(rest.slice(elsePos + 4).trim())
                this.Children.Push(this.ElseExpression)
            }
            else {
                this.Body = parseExpr(rest.slice(i + 1).trim())
                this.Children.Push(this.Body)
            }
            return true
        })

        // @ts-ignore
        if (!this.Condition)
            throw new LexerError('Could not find if condition ' + rest)
        // @ts-ignore
        if (!this.Body)
            throw new LexerError('Could not find if body ' + rest)
    }

    override Log(indent = 0) {
        console.log(' '.repeat(indent) + `${Console.Cyan + ExpressionTypes[this.ExpressionType] + Console.Reset} Condition:`)
        this.Condition.Log(indent + 1)
        console.log(' '.repeat(indent + 1) + `Body:`)
        this.Body.Log(indent + 1)
        if (this.ElseExpression) {
            console.log(' '.repeat(indent) + `Else:`)
            this.ElseExpression.Log()
        }
    }

    override traverse(recursionBody: recursionBody): recursionReturn {
        const end_name = `endif` + nextArbitraryIdentifier()
        const else_name = `else` + nextArbitraryIdentifier()

        return {
            Assembly: !this.ElseExpression ? [
                ...this.Condition.traverse(recursionBody).Assembly,
                `BEQ ${end_name}`,
                //true case
                ...this.Body.traverse(recursionBody).Assembly,
                `@${end_name}`,
            ] : [
                ...this.Condition.traverse(recursionBody).Assembly,
                `BEQ ${else_name}`,
                //true case
                ...this.Body.traverse(recursionBody).Assembly,
                `JMP ${end_name}`,
                `@${else_name}`,
                //else case
                ...this.ElseExpression.traverse(recursionBody).Assembly,
                `@${end_name}`,
            ],
            ReturnType: 'void'
        }
    }
}