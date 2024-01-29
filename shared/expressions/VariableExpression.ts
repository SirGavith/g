import { Expression, ExpressionTypes } from "./Expressions"
import { parseExpr, LexerError } from "../../lexer/lexer"
import * as Console from 'glib/dist/Console'
import { OperatorOverloadExpression } from "./OperatorOverloadExpression"
import { CompilerError, recursionBody, recursionReturn } from "../../compiler/compiler"


export class VariableExpression extends Expression {
    override ExpressionType: ExpressionTypes.Variable = ExpressionTypes.Variable
    Identifier: string
    
    constructor(identifier: string) {
        super()
        this.Identifier = identifier 
    }

    override Log(indent = 0) {
        console.log(' '.repeat(indent) + `${Console.Cyan + ExpressionTypes[this.ExpressionType]} ${Console.Red + this.Identifier + Console.Reset}`)
    }

    override traverse(recursionBody: recursionBody): recursionReturn {
        const variable = recursionBody.Variables.get(this.Identifier)
        if (variable === undefined)
            throw new CompilerError(`variable '${this.Identifier}' is not declared before usage`)

        return {
            Assembly: [
                `LDY #${variable.FrameLocation}`,
                `LDA (framePtr),Y`
            ],
            ReturnType: variable.Type
        }
    }
}