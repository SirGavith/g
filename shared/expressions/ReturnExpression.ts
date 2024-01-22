import { Expression, ExpressionTypes } from "./Expressions"
import { LexerError, parseExpr } from "../../lexer/lexer"
import * as Console from 'glib/dist/Console'
import { OperatorOverloadExpression } from "./OperatorOverloadExpression"


export class ReturnExpression extends Expression {
    override ExpressionType: ExpressionTypes.Return = ExpressionTypes.Return
    Expression?: Expression

    constructor(rest?: string) {
        super()
        
        this.Expression = rest === undefined ? rest : parseExpr(rest)
        if (this.Expression)
            this.Children.push(this.Expression)
    }

    override Log(indent = 0) {
        console.log(' '.repeat(indent) + `${Console.Cyan + ExpressionTypes[this.ExpressionType] + Console.Reset}:`)
        if (this.Expression)
            this.Expression?.Log(indent + 1)
        else console.log(' '.repeat(indent + 1) + Console.Magenta + 'void' + Console.Reset)
    }

    override getType(identifiers: Map<string, string>, validOperators: Map<string, OperatorOverloadExpression>): string {
        if (this.Expression === undefined) return 'void'
        return this.Expression?.getType(identifiers, validOperators)
    }

    override getAssembly(newVariableNameMap: Map<string, string>): string[] {
        return (this.Expression?.getAssembly(newVariableNameMap) ?? []).concat([
            `RTS`
        ])
    }
}