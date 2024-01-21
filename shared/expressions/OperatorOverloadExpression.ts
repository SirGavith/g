import { Expression, ExpressionTypes } from "../../lexer/expressions"
import { LexerError, isValidIdentifier, parseExpr } from "../../lexer/lexer"
import { Operators, operatorMappings } from "../../lexer/operators"

export interface FuncParameter {
    Type: string
    Identifier: string
}

export class OperatorOverloadExpression extends Expression {
    override ExpressionType: ExpressionTypes.OperatorOverload = ExpressionTypes.OperatorOverload

    ReturnType: string
    Operator: Operators
    Parameters: FuncParameter[] = []
    Body?: Expression

    constructor(rest?: string) {
        super()
        if (rest === undefined) 
            throw new LexerError('could not find func body')

        const spacePos = rest.indexOf(' ')

        this.Operator = operatorMappings[rest.slice(0, spacePos)]

        rest = rest.slice(spacePos + 1)

        const lParenIndex = rest.indexOf('(')

        this.ReturnType = rest.slice(0, lParenIndex).trim()

        if (!isValidIdentifier(this.ReturnType)) {
            throw new LexerError(`return type '${this.ReturnType}' is invalid`)
        }

        rest = rest.slice(lParenIndex + 1).trim()

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
