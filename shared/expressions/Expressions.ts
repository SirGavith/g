import { Operators } from '../operators'
import * as Console from 'glib/dist/Console'

export enum ExpressionTypes {
    Compound,
    Declaration,// let
    If,         // if
    Literal,    // \d
    Operation,  //
    Unknown,
    Variable,   // \w
    While,      // while
    Asm,        // asm
    Func,       // func
    FuncCall,   // \w()
    Return,     // return
    Struct,     // struct
    Class,      // class
    OperatorOverload, // operator
}

export abstract class Expression {
    ExpressionType: ExpressionTypes = ExpressionTypes.Unknown
    Log(indent: number = 0): void {}
}

export class CompoundExpression extends Expression {
    override ExpressionType: ExpressionTypes.Compound = ExpressionTypes.Compound
    Expressions: Expression[] = []
    Simplify() {
        return this.Expressions.length === 1 ? this.Expressions[0] : this
    }
    
    override Log(indent = 0) {
        console.log(' '.repeat(indent) + '[')
        this.Expressions.forEach(e => {
            e.Log(indent + 1)
        })
        console.log(' '.repeat(indent) + ']')
    }
}