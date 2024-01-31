import { Expression, ExpressionTypes } from "./Expressions"
import { LexerError, parseExpr } from "../../lexer/lexer"
import * as Console from 'glib/dist/Console'

export interface Method {

}


export class ClassExpression extends Expression {
    override ExpressionType: ExpressionTypes.Class = ExpressionTypes.Class
    Identifier: string
    Struct: string
    Methods: Method[]


    constructor(rest?: string) {
        super()
        if (rest === undefined)
            throw new LexerError('class body appears to be empty')
        throw new LexerError('classes not implemented')
    }

    override Log(indent = 0) {
        console.log(' '.repeat(indent) + `${Console.Cyan + ExpressionTypes[this.ExpressionType]} ${Console.Red + this.Identifier + Console.Reset} : ${Console.Magenta + this.Struct + Console.Reset}`)
        // this.Methods?.forEach(m => {
        //     m.Log(indent + 1)
        // })
    }

    
}