import { Expression, ExpressionTypes } from "./Expressions"
import { LexerError, isValidIdentifier, parseExpr } from "../../lexer/lexer"
import { Operators, operatorMapOprString, operatorMapStringOpr } from "../operators"
import * as Console from 'glib/dist/Console'

export interface FuncParameter {
    Type: string
    Identifier: string
}

export class OperatorOverloadExpression extends Expression {
    override ExpressionType: ExpressionTypes.OperatorOverload = ExpressionTypes.OperatorOverload

    ReturnType: string
    Operator: Operators
    Parameters: FuncParameter[] = []
    Body: Expression

    constructor(rest?: string) {
        super()
        if (rest === undefined) 
            throw new LexerError('could not find func body')

        const operandEndIndex = Math.min(rest.indexOf(' '), rest.indexOf('('))

        const operator = operatorMapStringOpr.get(rest.slice(0, operandEndIndex).trim())
        if (operator === undefined)
            throw new LexerError(`operator overload '${rest.slice(0, operandEndIndex)}' is not valid`)

        this.Operator = operator

        rest = rest.slice(operandEndIndex + 1).trim()

        const lParenIndex = rest.indexOf('(')

        this.ReturnType = rest.slice(0, lParenIndex).trim()

        if (!isValidIdentifier(this.ReturnType)) {
            throw new LexerError(`return type '${this.ReturnType}' is invalid`)
        }

        rest = rest.slice(lParenIndex + 1).trim()

        const rightParenIndex = rest.indexOf(')')

        rest.slice(0, rightParenIndex).trim().split(',').forEach(pair => {
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

        this.Body = parseExpr(rest)
    }

    override Log(indent = 0) {
        console.log(' '.repeat(indent) + `${Console.Cyan + ExpressionTypes[this.ExpressionType] + Console.Reset} ${operatorMapOprString.get(this.Operator!)} ${Console.Magenta + this.ReturnType + Console.Reset} :`)
        console.log(' '.repeat(indent) + this.Parameters.map(p =>
            `${Console.Red + p.Identifier} ${Console.Magenta + p.Type + Console.Reset}`
        ).join(', '))
        this.Body.Log(indent + 1)
    }
}
