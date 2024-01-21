import { Expression, ExpressionTypes } from "./Expressions"
import { LexerError, isValidIdentifier, parseExpr } from "../../lexer/lexer"

export interface FuncParameter {
    Type: string
    Identifier: string
}

export class FuncExpression extends Expression {
    override ExpressionType: ExpressionTypes.Func = ExpressionTypes.Func
    Identifier?: string
    ReturnType?: string
    Parameters: FuncParameter[] = []
    Body?: Expression

    constructor(rest?: string) {
        super()
        if (rest === undefined) 
            throw new LexerError('could not find func body')

        this.ReturnType = rest.slice(0, rest.indexOf(' '))
        if (!isValidIdentifier(this.ReturnType)) {
            throw new LexerError(`return type '${this.ReturnType}' is invalid`)
        }
        rest = rest.slice(this.ReturnType.length).trim()
        this.Identifier = rest.slice(0, rest.indexOf('('))
        if (!isValidIdentifier(this.Identifier)) {
            throw new LexerError(`type '${this.Identifier}' is invalid`)
        }
        rest = rest.slice(this.Identifier.length + 1).trim()
        const rightParenIndex = rest.indexOf(')')
        rest.slice(0, rightParenIndex).split(',').forEach(pair => {
            if (!pair) return
            const [type, identifier] = pair.trim().split(' ')

            if (!isValidIdentifier(type)) {
                throw new LexerError(`type '${type}' is invalid`)
            }
            if (!isValidIdentifier(identifier)) {
                throw new LexerError(`type '${identifier}' is invalid`)
            }
            this.Parameters.push({
                Type: type,
                Identifier: identifier
            })
        })
        rest = rest.slice(rightParenIndex + 1).trim()

        try {
            this.Body = parseExpr(rest)
        }
        catch (e) {
            console.error(e)
            throw new LexerError('func body parsing failed')
        }
    }
}
