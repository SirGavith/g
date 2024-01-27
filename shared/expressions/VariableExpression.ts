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
        const type = recursionBody.IdentifierType.get(this.Identifier)
        const frameLocation = recursionBody.VariableFrameLocationMap.get(this.Identifier)!
        if (type === undefined || frameLocation == undefined)
            throw new CompilerError(`variable '${this.Identifier}' is not declared before usage`)


        return {
            Assembly: [
                `LDY #${frameLocation}`,
                `LDA (framePtr),Y`
            ],
            ReturnType: type
        }
    }
}