import { LexerError, isValidIdentifier, parseExpr } from '../../lexer/lexer'
import { Expression, ExpressionTypes } from './Expressions'
import * as Console from 'glib/dist/Console'


export class DeclarationExpression extends Expression {
    override ExpressionType: ExpressionTypes.Declaration = ExpressionTypes.Declaration
    Identifier: string
    Type: string
    Initializer?: Expression

    constructor(rest?: string) {
        super()
        if (rest === undefined)
            throw new LexerError('Could not find let declaration')
        
        const eqIndex = rest.indexOf('=')

        const [type, identifier] = (eqIndex === -1 ? rest : rest.slice(0, eqIndex)).trim().split(' ').map(s => s.trim())

        const initializer = rest.slice(eqIndex + 1).trim()

        if (!isValidIdentifier(type)) {
            throw new LexerError(`type '${type}' is invalid`)
        }
        if (!isValidIdentifier(identifier)) {
            throw new LexerError(`identifier '${identifier}' is invalid`)
        }

        this.Identifier = identifier
        this.Type = type

        if (eqIndex !== -1) {
            this.Initializer = parseExpr(initializer)
        }

        if (this.Identifier === undefined)
            throw new LexerError('declaration must contain identifier')
    }

    override Log(indent = 0) {
        console.log(' '.repeat(indent) + `${Console.Cyan + ExpressionTypes[this.ExpressionType]} ${Console.Red + this.Identifier} ${Console.Magenta + this.Type + Console.Reset}${this.Initializer ? ':' : ''}`)
        this.Initializer?.Log(indent + 1)
    }
}