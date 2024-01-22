import { CompilerError } from '../../compiler/compiler'
import { Operators } from '../operators'
import * as Console from 'glib/dist/Console'
import { OperatorOverloadExpression } from './OperatorOverloadExpression'

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
    Include,     // include
}

export abstract class Expression {
    ExpressionType: ExpressionTypes = ExpressionTypes.Unknown
    Children: Expression[] = []
    Log(indent: number = 0): void {}

    getType(identifiers: Map<string, string>, validOperators: Map<string, OperatorOverloadExpression>): string { throw new CompilerError }
    getAssembly(newVariableNameMap: Map<string, string>): string[] { throw new CompilerError}  
}

export class CompoundExpression extends Expression {
    override ExpressionType: ExpressionTypes.Compound = ExpressionTypes.Compound
    Simplify() {
        return this.Children.length === 1 ? this.Children[0] : this
    }
    AddExpressions(expressions: Expression[]) {
        expressions.forEach(exp => this.Children.push(exp))
    }
    
    override Log(indent = 0) {
        console.log(' '.repeat(indent) + '[')
        this.Children.forEach(e => {
            e.Log(indent + 1)
        })
        console.log(' '.repeat(indent) + ']')
    }

    override getType(identifiers: Map<string, string>) {
        return 'void'
    }

    override getAssembly(newVariableNameMap: Map<string, string>): string[] {
        return this.Children.flatMap(child => child.getAssembly(newVariableNameMap))
    }
}