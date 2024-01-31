import { LexerError, isValidIdentifier, parseExpr } from '../../lexer/lexer'
import { Expression, ExpressionTypes } from './Expressions'
import * as Console from 'glib/dist/Console'
import { OperationExpression } from './OperationExpression'
import { Operators } from '../operators'
import { VariableExpression } from './VariableExpression'
import { CompilerError, recursionBody, recursionReturn } from "../../compiler/compiler"

export interface Variable {
    Identifier: string
    Type: string
    Size: number
    FrameLocation: number
}

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
            this.Initializer = new OperationExpression(Operators.SetEQ, 
                new VariableExpression(this.Identifier),
                parseExpr(initializer))
        }

        if (this.Identifier === undefined)
            throw new LexerError('declaration must contain identifier')
    }

    override Log(indent = 0) {
        console.log(' '.repeat(indent) + `${Console.Cyan + ExpressionTypes[this.ExpressionType]} ${Console.Red + this.Identifier} ${Console.Magenta + this.Type + Console.Reset}${this.Initializer ? ':' : ''}`)
    }


    // getVarType(validTypes: Map<string, number>) {
    //     if (!validTypes.has(this.Type)) 
    //         throw new CompilerError(`declaration type ${this.Type} is unknown`)
    //     this.Size = validTypes.get(this.Type)!
    //     return this.Type
    // }

    override traverse(recursionBody: recursionBody): recursionReturn {
        if (!recursionBody.TypeSizes.has(this.Type))
            throw new CompilerError(`type '${this.Type} is not defined when declaring variable'${this.Identifier}`)

        const t = recursionBody.TypeSizes.get(this.Type)!

        if (recursionBody.Variables.has(this.Identifier))
            throw new CompilerError(`variable '${this.Identifier}' is already defined`)


        recursionBody.Variables.set(this.Identifier, {
            Identifier: this.Identifier,
            Type: this.Type,
            Size: t.Size,
            FrameLocation: recursionBody.NextVariableLocation,
        })
        recursionBody.NextVariableLocation += t.Size

        return {
            Assembly: [
                `// ${ExpressionTypes[this.ExpressionType]}`,
                `LDA #${t.Size}`,
                `JSR alloca`
            ],
            ReturnType: 'void'
        }
    }
}