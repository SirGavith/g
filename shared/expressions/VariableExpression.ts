import { Expression, ExpressionTypes } from "./Expressions"
import { parseExpr, LexerError } from "../../lexer/lexer"
import * as Console from 'glib/dist/Console'


export class VariableExpression extends Expression {
    override ExpressionType: ExpressionTypes.Variable = ExpressionTypes.Variable
    
    constructor(identifier?: string) {
        super()
        this.Identifier = identifier 
    }
    Identifier?: string

    override Log(indent = 0) {
        console.log(' '.repeat(indent) + `${Console.Cyan + ExpressionTypes[this.ExpressionType]} ${Console.Red + this.Identifier + Console.Reset}`)
    }
}