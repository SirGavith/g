import { LexerError, isValidIdentifier, parseExpr } from '../../lexer/lexer'
import { Expression, ExpressionTypes } from '../../lexer/expressions'


export class DeclarationExpression extends Expression {
    override ExpressionType: ExpressionTypes.Declaration = ExpressionTypes.Declaration
    Identifier?: string
    Type?: string
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
            try {
                this.Initializer = parseExpr(initializer)
            }
            catch (e) {
                console.error(e)
                throw new LexerError('declaration parsing failed')
            }
        }

        if (this.Identifier === undefined)
            throw new LexerError('declaration must contain identifier')
    }
}