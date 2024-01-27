import { Expression, ExpressionTypes } from "./Expressions"
import { parseExpr } from "../../lexer/lexer"
import * as Console from 'glib/dist/Console'
import { recursionBody, recursionReturn } from "../../compiler/compiler"


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


    override traverse(recursionBody: recursionBody): recursionReturn {
        const expr = this.Expression?.traverse(recursionBody)

        return {
            Assembly: (expr?.Assembly ?? []).concat([
                `RTS`
            ]),
            ReturnType: expr === undefined ? 'void' : expr.ReturnType
        }
    }
}