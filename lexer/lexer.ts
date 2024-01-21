import { CustomError } from 'glib/dist/Error'
import { CompoundExpression, Expression } from '../shared/expressions/Expressions'
import { binaries, unaryPostfixes, unaryPrefixes } from '../shared/operators'

import { AsmExpression } from '../shared/expressions/AsmExpression'
import { ClassExpression } from '../shared/expressions/ClassExpression'
import { DeclarationExpression } from '../shared/expressions/DeclarationExpression'
import { FuncCallExpression } from '../shared/expressions/FuncCallExpression'
import { FuncExpression } from '../shared/expressions/FuncExpression'
import { IfExpression, } from '../shared/expressions/IfExpression'
import { LiteralExpression } from '../shared/expressions/LiteralExpression'
import { OperationExpression } from '../shared/expressions/OperationExpression'
import { OperatorOverloadExpression } from '../shared/expressions/OperatorOverloadExpression'
import { ReturnExpression } from '../shared/expressions/ReturnExpression'
import { StructExpression, } from '../shared/expressions/StructExpression'
import { VariableExpression } from '../shared/expressions/VariableExpression'
import { WhileExpression, } from '../shared/expressions/WhileExpression'


export class LexerError extends CustomError { constructor(...message: any[]) { super(message); this.name = this.constructor.name} }

export function Lexer(c: string) {
    const code = c.SplitLines()
        .map(l => l.includes('//') ? l.slice(0, l.indexOf('//')) : l)
        .join('')
        .replaceAll(/\s+/g, ' ').Log()

    return parseExpr(code)
}

export function isValidIdentifier(identifier: string): boolean {
    return identifier.RegexTest(/^[_A-Za-z]+[-\w]*$/g)
}

export function forEachScopedExprOnDelim(code: string, delim: string, lambda: (s: string, i: number) => boolean | void) {
    let lastDelimIndex = 0
    let exprLevel = 0
    code.forEach((char, i) => {
        if      (char === '{' || char === '(' || char === '[') exprLevel++
        else if (char === '}' || char === ')' || char === ']') exprLevel--

        if ((char === delim && exprLevel === 0) || i === code.length - 1) {
            if (i === code.length - 1) i++
            let expr = code.slice(lastDelimIndex, i).trim()
            if (expr.endsWith(delim)) expr = expr.slice(0, -delim.length).trim()
            lastDelimIndex = i + 1
            return lambda(expr, i)
        }
    })
}

export function parseExpr(code: string): Expression {
    const compound = new CompoundExpression
    if ((code.startsWith('{') && code.endsWith('}')) || (code.startsWith('(') && code.endsWith(')'))) code = code.slice(1, -1)

    forEachScopedExprOnDelim(code, ';', expr => {
        compound.Expressions.push(tokenizeExpr(expr))
    })

    return compound.Simplify()
}

function tokenizeExpr(expr: string) {
    const compound = new CompoundExpression

    const groups = (/^([_A-Za-z]+[-\w]*(?:\.[_A-Za-z]+[-\w]*)*)(.*)$/g).exec(expr)
    
    let keyword = groups?.at(1) ?? expr
    let rest = groups?.at(2)?.trim() || undefined

    if (keyword === 'asm') {
        compound.Expressions.push(new AsmExpression(rest))
    }
    else if (keyword === 'class') {
        compound.Expressions.push(new ClassExpression(rest))
    }
    else if (keyword === 'let') {
        compound.Expressions.push(new DeclarationExpression(rest))
    }
    else if (keyword === 'func') {
        compound.Expressions.push(new FuncExpression(rest))
    }
    else if (keyword === 'if') {
        compound.Expressions.push(new IfExpression(rest))
    }
    else if (keyword === 'operator') {
        compound.Expressions.push(new OperatorOverloadExpression(rest))
    }
    else if (keyword === 'return') {
        compound.Expressions.push(new ReturnExpression(rest))
    }
    else if (keyword === 'struct') {
        compound.Expressions.push(new StructExpression(rest))
    }
    else if (keyword === 'while') {
        compound.Expressions.push(new WhileExpression(rest))
    }
    else if (keyword.RegexTest(/^\d+$/g) && rest === undefined) {
        compound.Expressions.push(new LiteralExpression(keyword.toInt()))
    }
    else if (keyword.RegexTest(/^0x[\dA-Fa-f]+$/g) && rest === undefined) {
        compound.Expressions.push(new LiteralExpression(keyword.slice(2).toInt(16)))
    }
    else if (keyword.RegexTest(/^[_A-Za-z]+[-\w]*(\.[_A-Za-z]+[-\w]*)*$/g) && rest === undefined) {
        const exp = new VariableExpression
        exp.Identifier = keyword
        compound.Expressions.push(exp)
    }
    else if (isValidIdentifier(keyword) && rest?.startsWith('(')) {
        compound.Expressions.push(new FuncCallExpression(expr))
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

            for (const [operator, optype] of unaryPostfixes) {
                if (r.startsWith(operator)) {
                    exp.Operator = optype
                    exp.Operand = parseExpr(expr.slice(0, i))
                    compound.Expressions.push(exp)
                    break main_loop
                }
            }
            for (const [operator, optype] of binaries) {
                if (r.startsWith(operator)) {
                    exp.Operator = optype
                    exp.Operand = parseExpr(expr.slice(0, i).trim())
                    exp.Operand2 = parseExpr(expr.slice(i + operator.length).trim())
                    compound.Expressions.push(exp)
                    break main_loop
                }
            }
            for (const [operator, optype] of unaryPrefixes) {
                if (r.startsWith(operator)) {
                    exp.Operator = optype
                    exp.Operand = parseExpr(expr.slice(i + operator.length))
                    compound.Expressions.push(exp)
                    break main_loop
                }
            }
        }
    }

    return compound.Simplify()
}