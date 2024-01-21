import { Expression, ExpressionTypes } from "./Expressions"
import { LexerError, parseExpr } from "../../lexer/lexer"

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
}