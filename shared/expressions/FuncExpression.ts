import { Expression, ExpressionTypes } from "./Expressions"
import { LexerError, isValidIdentifier, parseExpr } from "../../lexer/lexer"
import * as Console from 'glib/dist/Console'
import { CompilerError, recursionBody, recursionReturn } from "../../compiler/compiler"

export interface FuncParameter {
    Type: string
    Identifier: string
    Size?: number
}

export class FuncExpression extends Expression {
    override ExpressionType: ExpressionTypes.Func = ExpressionTypes.Func
    Identifier: string
    ReturnType: string
    Parameters: FuncParameter[] = []
    Body: Expression

    constructor(rest?: string) {
        super()
        if (rest === undefined) 
            throw new LexerError('could not find func body')

        this.ReturnType = rest.slice(0, rest.indexOf(' ')).trim()
        if (!isValidIdentifier(this.ReturnType)) {
            throw new LexerError(`return type '${this.ReturnType}' is invalid`)
        }
        rest = rest.slice(this.ReturnType.length).trim()
        this.Identifier = rest.slice(0, rest.indexOf('(')).trim()
        if (!isValidIdentifier(this.Identifier)) {
            throw new LexerError(`type '${this.Identifier}' is invalid`)
        }
        rest = rest.slice(this.Identifier.length + 1).trim()
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
                Identifier: identifier,
                Size: undefined
            })
        })
        rest = rest.slice(rightParenIndex + 1).trim()

        this.Body = parseExpr(rest)
        this.Children.Push(this.Body)
    }

    override Log(indent = 0) {
        console.log(' '.repeat(indent) + `${Console.Cyan + ExpressionTypes[this.ExpressionType]} ${Console.Red + this.Identifier} ${Console.Magenta + this.ReturnType + Console.Reset} Params:`)
        console.log(' '.repeat(indent + 1) + this.Parameters.map(p => 
            `${Console.Red + p.Identifier} ${Console.Magenta + p.Type + Console.Reset}`
        ).join(', '))
        console.log(' '.repeat(indent + 1) + 'Body:')
        this.Body.Log(indent + 1)
    }



    override traverse(recursionBody: recursionBody): recursionReturn {
        const newRecursionBody: recursionBody = {
            TypeSizes: recursionBody.TypeSizes,
            Variables: new Map,
            NextVariableLocation: 2,
            Functions: recursionBody.Functions,
            OperatorOverloads: recursionBody.OperatorOverloads,
        }

        this.Parameters.forEach(param => {
            if (!param.Size) param.Size = recursionBody.TypeSizes.get(param.Type)?.Size
            if (!param.Size) throw new CompilerError(`parameter type '${param.Type}' is undefined at param ${param.Identifier} in funciton ${this.Identifier}`)

            newRecursionBody.Variables.set(param.Identifier, {
                Identifier: param.Identifier,
                Type: param.Type,
                Size: param.Size,
                FrameLocation: recursionBody.NextVariableLocation,
            })
            recursionBody.NextVariableLocation += param.Size
        })

        const body = this.Body.traverse(newRecursionBody)

        return {
            Assembly: [
                `// ${ExpressionTypes[this.ExpressionType]}`,
                `@${this.Identifier}`,
                ...body.Assembly,
            ],
            ReturnType: 'void'
        }
    }
}
