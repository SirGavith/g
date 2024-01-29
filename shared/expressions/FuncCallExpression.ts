import { Expression, ExpressionTypes } from "./Expressions"
import { LexerError, forEachScopedExprOnDelim, isValidIdentifier, parseExpr } from "../../lexer/lexer"
import * as Console from 'glib/dist/Console'
import { CompilerError, recursionBody, recursionReturn } from "../../compiler/compiler"


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
            const e = parseExpr(exp)
            this.Parameters.push(e)
            this.Children.Push(e)
        })
    }

    override Log(indent = 0) {
        console.log(' '.repeat(indent) + `${Console.Cyan + ExpressionTypes[this.ExpressionType]} ${Console.Red + this.Identifier + Console.Reset} Params:`)
        this.Parameters.forEach(p => {
            p.Log(indent + 1)
        })
    }


    override traverse(recursionBody: recursionBody): recursionReturn {
        const func = recursionBody.Functions.get(this.Identifier)
        
        if (func === undefined)
            throw new CompilerError(`function '${this.Identifier}' is not declared before usage`)
    
        const params = this.Parameters.map(p => p.traverse(recursionBody))

        if (params.some((p, i) => p.ReturnType !== func.Parameters[i].Type))
            throw new CompilerError(`function '${this.Identifier}' parameters do not match caller`)

        return {
            Assembly: [
                //load params
                `LDA #${this.Parameters.length}`,
                ...params.flatMap((p, i) => [
                    ...p.Assembly,
                    `LDY #${i + 2}`,
                    `STA (stackPtr),Y`,
                ]),
                `JSR pushStackFrame`,
                `JSR ${this.Identifier}`,
                `JSR popStackFrame`,
            ],
            ReturnType: func.ReturnType
        }
    }
}
