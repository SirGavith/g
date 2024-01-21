import { Expression, ExpressionTypes } from "./Expressions"
import { LexerError } from "../../lexer/lexer"


export class AsmExpression extends Expression {
    override ExpressionType: ExpressionTypes.Asm = ExpressionTypes.Asm
    Body: string[] = []

    constructor(rest?: string) {
        super()
        if (rest === undefined)
            throw new LexerError('asm body appears to be empty')

        if (rest.startsWith('{') && rest.endsWith('}')) {
            rest = rest.slice(1, -1)
        }

        rest.split(';').forEach(line => {
            line = line.trim()
            if (line) this.Body.push(line)
        })
    }
}