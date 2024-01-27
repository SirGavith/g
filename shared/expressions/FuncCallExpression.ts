import { Expression, ExpressionTypes } from "./Expressions"
import { LexerError, forEachScopedExprOnDelim, isValidIdentifier, parseExpr } from "../../lexer/lexer"
import * as Console from 'glib/dist/Console'
import { CompilerError } from "../../compiler/compiler"


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

    override getType(identifiers: Map<string, string>) {
        const returnType = identifiers.get(this.Identifier)
        if (returnType === undefined)
            throw new CompilerError(`function '${this.Identifier}' is not declared before usage`)
        return returnType
    }

    override getAssembly(variableFrameLocationMap: Map<string, number>): string[] {
        return [
            //load params
            `LDA #${this.Parameters.length}`,
            ...this.Parameters.flatMap((param, i) => [
                ...param.getAssembly(variableFrameLocationMap),
                `LDY #${i + 2}`,
                `STA (stackPtr),Y`,
            ]),
            `JSR pushStackFrame`,
            `JSR ${this.Identifier}`,
            `JSR popStackFrame`,
        ]
    }
}
