import { Operators } from './operators'

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
    Return,     // return
    Class,      // class
    OperatorOverload, // operator
}

// export type Expression = CompoundExpression | DeclarationExpression | IfExpression | LiteralExpression | OperationExpression | VariableExpression | WhileExpression

export abstract class Expression {
    ExpressionType: ExpressionTypes = ExpressionTypes.Unknown
}

export class CompoundExpression extends Expression {
    override ExpressionType: ExpressionTypes.Compound = ExpressionTypes.Compound
    Expressions: Expression[] = []
    Simplify() {
        return this.Expressions.length === 1 ? this.Expressions[0] : this
    }
    // override Log(indent = 0) {
    //     console.log(' '.repeat(indent) + '[')
    //     this.Expressions.forEach(e => {
    //         e.Log(indent + 1)
    //     })
    //     console.log(' '.repeat(indent) + ']')
    // }
}




export class OperationExpression extends Expression {
    override ExpressionType: ExpressionTypes.Operation = ExpressionTypes.Operation
    Operand?: Expression
    Operator?: Operators
    Operand2?: Expression
}

export class VariableExpression extends Expression {
    override ExpressionType: ExpressionTypes.Variable = ExpressionTypes.Variable
    constructor(identifier?: string) { super(); this.Identifier = identifier }
    Identifier?: string
}