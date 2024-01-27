import { Expression, ExpressionTypes } from "./Expressions"
import { DeclarationExpression } from "./DeclarationExpression"
import { parseExpr, LexerError } from "../../lexer/lexer"
import * as Console from 'glib/dist/Console'
import { CompilerError, recursionBody, recursionReturn } from "../../compiler/compiler"

export class StructExpression extends Expression {
    override ExpressionType: ExpressionTypes.Struct = ExpressionTypes.Struct
    Identifier: string
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
            if (declaration === '') return
            const decl = new DeclarationExpression(declaration.trim())
            this.Members.push(decl)
            this.Children.push(decl)
        })

        if (this.Members.length === 0)
            throw new LexerError('Could not find struct members ' + rest)
    }

    override Log(indent = 0) {
        console.log(' '.repeat(indent) + `${Console.Cyan + ExpressionTypes[this.ExpressionType]} ${Console.Red + this.Identifier + Console.Reset}:`)
        this.Members.forEach(m => {
            m.Log(indent + 1)
        })
    }

    getSize() {
        return this.Members.length // FOR ARRAYS THIS NEEDS TO CHANGE
    }

    override traverse(recursionBody: recursionBody): recursionReturn {
        throw new CompilerError('recursed on a struct')

    }
}