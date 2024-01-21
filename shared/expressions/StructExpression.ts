import { Expression, ExpressionTypes } from "./Expressions"
import { DeclarationExpression } from "./DeclarationExpression"
import { parseExpr, LexerError } from "../../lexer/lexer"

export class StructExpression extends Expression {
    override ExpressionType: ExpressionTypes.While = ExpressionTypes.While
    Identifier?: string
    Members: DeclarationExpression[] = []

    constructor(rest?: string) {
        super()
        if (rest === undefined)
            throw new LexerError('Could not find struct body')

        const delimPos = rest.indexOf('{')
        this.Identifier = rest.slice(0, delimPos).trim()

        if (!this.Identifier.RegexTest(/^[_A-Za-z]+[-\w]*$/g)) {
            throw new LexerError(`type '${this.Identifier}' is invalid`)
        }

        rest.slice(delimPos + 1, -1).trim().split(';').forEach(declaration => {
            try {
                if (declaration === '') return
                this.Members.push(new DeclarationExpression(declaration.trim()))
            }
            catch (e) {
                console.error(e)
                throw new LexerError('struct members must be valid declarations')
            }
        })

        if (this.Members.length === 0)
            throw new LexerError('Could not find struct members ' + rest)
    }
}