import { CompilerError, nextArbitraryIdentifier, recursionReturn, recursionBody } from '../../compiler/compiler'
import { Operators } from '../operators'
import * as Console from 'glib/dist/Console'
import { OperatorOverloadExpression } from './OperatorOverloadExpression'
import { FuncExpression } from './FuncExpression'

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

    // getType(identifiers: Map<string, string>, validOperators: Map<string, OperatorOverloadExpression>): string { throw new CompilerError }
    // getAssembly(variableFrameLocationMap: Map<string, number>): string[] { throw new CompilerError}  
    traverse(recursionBody: recursionBody): recursionReturn { throw new CompilerError }
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

    override traverse(recursionBody: recursionBody): recursionReturn {
        const endName = 'END_' + nextArbitraryIdentifier()

        return {
            Assembly: [
                `// ${ExpressionTypes[this.ExpressionType]}`,
                ...this.Children.flatMap(child => {
                    if (child.ExpressionType === ExpressionTypes.Func) {
                        const func = child as FuncExpression
                        recursionBody.Functions.set(func.Identifier, func)
                        return []
                    }
                    return child.traverse(recursionBody).Assembly
                }),
                `JMP ${endName}`,
                ...this.Children.flatMap(child => {
                    if (child.ExpressionType !== ExpressionTypes.Func) return []
                    return child.traverse(recursionBody).Assembly
                }),
                `@${endName}`,
            ],
            ReturnType: 'void'
        }
    }
}