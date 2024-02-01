import { Expression, ExpressionTypes } from "./Expressions"
import { LexerError, forEachScopedExprOnDelim, isValidIdentifier, parseExpr } from "../../lexer/lexer"
import * as Console from 'glib/dist/Console'
import { CompilerError, recursionBody, recursionReturn } from "../../compiler/compiler"


export class FuncCallExpression extends Expression {
    override ExpressionType: ExpressionTypes.FuncCall = ExpressionTypes.FuncCall
    Identifier: string
    Parameters: Expression[] = []

    constructor(expr?: string) {
        super()
        if (expr === undefined)
            throw new LexerError('could not find func body')

        this.Identifier = expr.slice(0, expr.indexOf('(')).trim()
        if (!isValidIdentifier(this.Identifier)) {
            throw new LexerError(`type '${this.Identifier}' is invalid`)
        }
        
        expr = expr.slice(this.Identifier.length).trim()
        if (!expr.startsWith('(') || !expr.endsWith(')'))
            throw new Error('function call must begin and end with parens')
        expr = expr.slice(1, -1).trim()


        forEachScopedExprOnDelim(expr, ',', exp => {
            const e = parseExpr(exp)
            this.Parameters.push(e)
            this.Children.Push(e)
        })
    }

    override Log(indent = 0) {
        console.log(' '.repeat(indent) + `${Console.Cyan + ExpressionTypes[this.ExpressionType]} ${Console.Red + this.Identifier + Console.Reset} Params:`)
        this.Parameters.forEach(p => {
            p.Log(indent + 1)
        })
    }


    override traverse(recursionBody: recursionBody): recursionReturn {
        const func = recursionBody.Functions.get(this.Identifier)
        
        if (func === undefined)
            throw new CompilerError(`function '${this.Identifier}' is not declared before usage`)
    
        
        if (this.Parameters.length !== func.Parameters.length)
        throw new CompilerError(`function '${this.Identifier}' parameters do not match caller`)
    
    
        let paramsSize = 0
        const paramAsm = []
    
        for (let i = 0; i < this.Parameters.length; i++) {
            const p = this.Parameters[i].traverse(recursionBody)
            const def = func.Parameters[i]
            
            if (p.ReturnType !== def.Type)
                throw new CompilerError(`function '${this.Identifier}' parameters do not match caller`)

            if (!def.Size) def.Size = recursionBody.TypeSizes.get(def.Type)?.Size
            if (!def.Size) throw new CompilerError(`parameter type '${def.Type}' is undefined at param ${def.Identifier} in funciton ${def.Identifier}`)

            
            //TODO: need to copy all bytes of param
            paramAsm.push(
                ...p.Assembly,
                `// Copy as param`,
                `LDY #${paramsSize + 2}`,
                `STA (stackPtr),Y`,
            )
            paramsSize += def.Size
        }

        return {
            Assembly: [
                //load params
                `// ${ExpressionTypes[this.ExpressionType]}`,
                ...paramAsm,
                `LDA #${paramsSize}`,
                `JSR pushStackFrame`,
                `JSR ${this.Identifier}`,
                `JSR popStackFrame`,
            ],
            ReturnType: func.ReturnType
        }
    }
}
