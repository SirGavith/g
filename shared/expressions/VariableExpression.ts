import { Expression, ExpressionTypes } from "./Expressions"
import { parseExpr, LexerError } from "../../lexer/lexer"
import * as Console from 'glib/dist/Console'
import { OperatorOverloadExpression } from "./OperatorOverloadExpression"
import { CompilerError } from "../../compiler/compiler"


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

    override getType(identifiers: Map<string, string>, validOperators: Map<string, OperatorOverloadExpression>): string {
        const type = identifiers.get(this.Identifier)
        if (type === undefined)
            throw new CompilerError(`variable '${this.Identifier}' is not declared before usage`)
        return type
    }

    override getAssembly(newVariableNameMap: Map<string, string>): string[] {
        return [
            `LDA ${newVariableNameMap.get(this.Identifier) ?? this.Identifier}`
        ]
    }
}