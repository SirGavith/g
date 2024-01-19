import { CustomError } from "../shared/Error"
import * as glibs from 'glib/dist/String'
import * as gliba from 'glib/dist/Array'

export class LexerError extends CustomError { constructor(...message: any[]) { super(message); this.name = this.constructor.name} }

export enum Operators {
    And,
    Or,
    Plus,
    PlusEQ,
    Minus,
    MinusEQ,
    Times,
    TimesEQ,
    Div,
    DivEQ,
    Mod,
    ModEQ,
    Increment,
    Decrement,
    SetEquals,
    IsEqual,
    IsNotEqual,
    Not,
    GreaterThan,
    GreaterThanEQ,
    LessThan,
    LessThanEQ,
    //BitshiftR,
    //BitshiftL
}
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

export function Lexer(c: string) {
    const code = c.replaceAll(/\s+/g, '').Log()

    // let:a=4,b=1;if(a>b){a++;}else{a--;};b+=a;while(b>0){b--;};

    return parseExpr(code, [])
}

function parseExpr(code: string, identifiers: string[]): Expression {
    const compound = new CompoundExpression
    let lastsemi = 0,
        exprLevel = 0
    if ((code.startsWith('{') && code.endsWith('}')) || (code.startsWith('(') && code.endsWith(')'))) code = code.slice(1, -1)

    for (let [char, i] of code.toArray().WithIndices()) {
        if (char === '{') exprLevel++
        else if (char === '}') exprLevel--
        if ((char === ';' && exprLevel === 0) || i === code.length - 1) {
            if (i === code.length - 1) i++
            let expr = code.substring(lastsemi, i)
            if (expr.endsWith(';')) expr = expr.slice(0, -1)
            compound.Expressions.push(tokenizeExpr(expr, identifiers))
            lastsemi = i + 1
        }
    }
    return compound.Simplify()
}

function tokenizeExpr(expr: string, identifiers: string[]) {
    const compound = new CompoundExpression
    // let:a=4,b=1
    // if(a>b){a++;}else{a--;}
    // b+=a
    // while(b>0){b--;}

    let word, rest
    for (const [char, i] of expr.toArray().WithIndices()) {
        if (char.RegexTest(/\W/g)) {
            word = expr.slice(0, i)
            rest = expr.slice(i)
            break
        }
    }
    if (!word || !rest) {
        word = expr
        rest = ''
    }

    if (word === 'let') {
        const exp = new DeclarationExpression
        expr.slice(4).split(',').map(p => p.split('=')).forEach(decl => {
            const id = decl[0]
            if (decl.length === 1) {
                identifiers.push(id)
                exp.Identifiers.push(id)
            }
            else if (decl.length === 2) {
                identifiers.push(id)
                exp.Identifiers.push(id)
                exp.Initializers[id] = parseExpr(decl[1], identifiers)
            }
        })
        compound.Expressions.push(exp)
    }
    else if (word === 'if') {
        const exp = new IfExpression
        let parenDepth = 0
        for (const [char, i] of rest.toArray().WithIndices()) {
            if (char === '(') parenDepth++
            else if (char === ')') parenDepth--
            if (char !== ')' || parenDepth !== 0) continue
            exp.Condition = parseExpr(rest.substring(1, i), identifiers)
            const elsePos = rest.indexOf('else', i)
            if (elsePos !== -1) {
                exp.Body = parseExpr(rest.substring(i + 1, elsePos), identifiers)
                exp.ElseExpression = parseExpr(rest.substring(elsePos + 4), identifiers)
            }
            else {
                exp.Body = parseExpr(rest.substring(i + 1), identifiers)
            }
            break
        }
        if (!exp.Condition) throw new LexerError('Could not find while condition ' + rest)
        if (!exp.Body) throw new LexerError('Could not find while body ' + rest)
        compound.Expressions.push(exp)
    }
    else if (word === 'while') {
        const exp = new WhileExpression
        let parenDepth = 0
        for (const [char, i] of rest.toArray().WithIndices()) {
            if (char === '(') parenDepth++
            else if (char === ')') parenDepth--
            if (char !== ')' || parenDepth !== 0) continue
            exp.Condition = parseExpr(rest.substring(1, i), identifiers)
            exp.Body = parseExpr(rest.substring(i + 1), identifiers)
            break
        }
        if (!exp.Condition) throw new LexerError('Could not find while condition ' + rest)
        if (!exp.Body) throw new LexerError('Could not find while body ' + rest)
        compound.Expressions.push(exp)
    }
    else if (word === 'true' && rest === '') {
        const exp = new LiteralExpression
        exp.Value = 1
        compound.Expressions.push(exp)
    }
    else if (word === 'false' && rest === '') {
        const exp = new LiteralExpression
        exp.Value = 0
        compound.Expressions.push(exp)
    }
    else if (!word.RegexTest(/\D+/g) && rest === '') {
        const exp = new LiteralExpression
        exp.Value = word.toInt()
        compound.Expressions.push(exp)
    }
    else if (identifiers.includes(word) && rest === '') {
        const exp = new VariableExpression
        exp.Identifier = word
        compound.Expressions.push(exp)
    }
    else {
        let parenDepth = 0
        main_loop:
        for (const [char, i] of expr.toArray().WithIndices()) {
            if (char === '(') parenDepth++
            else if (char === ')') parenDepth--
            else if (parenDepth !== 0) continue

            const r = expr.slice(i)
            const exp = new OperationExpression

            const binaries: [string, Operators][] = [
                ['==', Operators.IsEqual],
                ['!=', Operators.IsNotEqual],
                ['&&', Operators.And],
                ['||', Operators.Or],
                ['+=', Operators.PlusEQ],
                ['+', Operators.Plus],
                ['-=', Operators.MinusEQ],
                ['-', Operators.Minus],
                ['*=', Operators.TimesEQ],
                ['*', Operators.Times],
                ['/=', Operators.DivEQ],
                ['/', Operators.Div],
                ['%=', Operators.ModEQ],
                ['%', Operators.Mod],
                ['=', Operators.SetEquals],
                ['>=', Operators.GreaterThanEQ],
                ['>', Operators.GreaterThan],
                ['<=', Operators.LessThanEQ],
                ['<', Operators.LessThan],
            ]
            const unaryPrefixes: [string, Operators][] = [
                ['!', Operators.Not],
            ]
            const unaryPostfixes: [string, Operators][] = [
                ['++', Operators.Increment],
                ['--', Operators.Decrement],
            ]
            for (const [operator, optype] of unaryPostfixes) {
                if (r.startsWith(operator)) {
                    exp.Operator = optype
                    exp.Operand = parseExpr(expr.slice(0, i), identifiers)
                    compound.Expressions.push(exp)
                    break main_loop
                }
            }
            for (const [operator, optype] of binaries) {
                if (r.startsWith(operator)) {
                    exp.Operator = optype
                    exp.Operand = parseExpr(expr.slice(0, i), identifiers)
                    exp.Operand2 = parseExpr(expr.slice(i + operator.length), identifiers)
                    compound.Expressions.push(exp)
                    break main_loop
                }
            }
            for (const [operator, optype] of unaryPrefixes) {
                if (r.startsWith(operator)) {
                    exp.Operator = optype
                    exp.Operand = parseExpr(expr.slice(i + operator.length), identifiers)
                    compound.Expressions.push(exp)
                    break main_loop
                }
            }
        }
    }

    return compound.Simplify()
}