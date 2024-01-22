import { Expression, ExpressionTypes } from "./Expressions"
import { LexerError } from "../../lexer/lexer"
import * as Console from 'glib/dist/Console'
import { CompilerError } from "../../compiler/compiler"


export class AsmExpression extends Expression {
    override ExpressionType: ExpressionTypes.Asm = ExpressionTypes.Asm
    Body: string[] = []

    constructor(rest?: string) {
        super()
        if (rest === undefined)
            throw new LexerError('asm body appears to be empty')

        if (rest.startsWith('{') && rest.endsWith('}')) {
            rest = rest.slice(1, -1).trim()
        }

        rest.split(';').forEach(line => {
            line = line.trim()
            if (line) this.Body.push(line)
        })
    }

    override Log(indent = 0) {
        console.log(' '.repeat(indent) + `${Console.Cyan + ExpressionTypes[this.ExpressionType] + Console.Reset}:`)

        this.Body.forEach(line => {
            console.log(' '.repeat(indent + 1) + line)
        })

    }

    override getType(identifiers: Map<string, string>) {
        return 'byte'
    }

    override getAssembly(newVariableNameMap: Map<string, string>): string[] {
        return this.Body.map(l => {
            const [_, id] = l.split(' ')
            if (newVariableNameMap.has(id)) {
                return l.replace(id, newVariableNameMap.get(id)!)
            }
            return l
        })
    }
}