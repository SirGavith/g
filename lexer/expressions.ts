import { Operators } from './operators'

export enum ExpressionTypes {
    Compound,
    Declaration,
    If,
    Literal,
    Operation,
    Unknown,
    Variable,
    While,
}

export type Expression = CompoundExpression | DeclarationExpression | IfExpression | LiteralExpression | OperationExpression | VariableExpression | WhileExpression

abstract class ExpressionBase {
    Type: ExpressionTypes = ExpressionTypes.Unknown
}

export class CompoundExpression extends ExpressionBase {
    override Type: ExpressionTypes.Compound = ExpressionTypes.Compound
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

export class DeclarationExpression extends ExpressionBase {
    override Type: ExpressionTypes.Declaration = ExpressionTypes.Declaration
    Identifiers: string[] = []
    Initializers: { [key: string]: Expression } = {}
}

export class IfExpression extends ExpressionBase {
    override Type: ExpressionTypes.If = ExpressionTypes.If
    Condition?: Expression
    Body?: Expression
    ElseExpression?: Expression
}

export class LiteralExpression extends ExpressionBase {
    override Type: ExpressionTypes.Literal = ExpressionTypes.Literal
    Value?: number
}

export class OperationExpression extends ExpressionBase {
    override Type: ExpressionTypes.Operation = ExpressionTypes.Operation
    Operand?: Expression
    Operator?: Operators
    Operand2?: Expression
}

export class VariableExpression extends ExpressionBase {
    override Type: ExpressionTypes.Variable = ExpressionTypes.Variable
    constructor(identifier?: string) { super(); this.Identifier = identifier }
    Identifier?: string
}

export class WhileExpression extends ExpressionBase {
    override Type: ExpressionTypes.While = ExpressionTypes.While
    Condition?: Expression
    Body?: Expression
}