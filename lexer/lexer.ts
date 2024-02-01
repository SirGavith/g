import { CustomError } from 'glib/dist/Error'
import { CompoundExpression, Expression, ExpressionTypes } from '../shared/expressions/Expressions'
import { Operators, binaries, operatorMapStringOpr, unaryPostfixes, unaryPrefixes } from '../shared/operators'

import { AsmExpression } from '../shared/expressions/AsmExpression'
import { ClassExpression } from '../shared/expressions/ClassExpression'
import { DeclarationExpression } from '../shared/expressions/DeclarationExpression'
import { FuncCallExpression } from '../shared/expressions/FuncCallExpression'
import { FuncExpression } from '../shared/expressions/FuncExpression'
import { IfExpression, } from '../shared/expressions/IfExpression'
import { IncludeExpression, } from '../shared/expressions/IncludeExpression'
import { LiteralExpression } from '../shared/expressions/LiteralExpression'
import { OperationExpression } from '../shared/expressions/OperationExpression'
import { OperatorOverloadExpression } from '../shared/expressions/OperatorOverloadExpression'
import { ReturnExpression } from '../shared/expressions/ReturnExpression'
import { StructExpression, } from '../shared/expressions/StructExpression'
import { VariableExpression } from '../shared/expressions/VariableExpression'
import { WhileExpression, } from '../shared/expressions/WhileExpression'


export class LexerError extends CustomError { constructor(...message: any[]) { super(message); this.name = this.constructor.name} }

let FileDir: string;
export function Lexer(c: string, fileDir: string, debug: boolean = false): Expression {
    FileDir = fileDir
    const code = c.SplitLines()
        .map(l => l.includes('//') ? l.slice(0, l.indexOf('//')) : l)
        .join('')
        .replaceAll(/\s+/g, ' ')
    if (debug) code.Log()

    return parseExpr(code)
}

export function isValidIdentifier(identifier: string): boolean {
    return identifier.RegexTest(/^[_A-Za-z]+[-\w]*$/g)
}

// export function forEachScopedExpr(code: string, lambda: (s: string, i: number) => boolean | void ) {
//     let parenDepth = 0
//     for (const [char, i] of code.toArray().WithIndices()) {
//         if (char === '(') parenDepth++
//         else if (char === ')') parenDepth--
//         else if (parenDepth !== 0) continue

//         const r = code.slice(i)
//         for (const [oprString, operator] of operatorMapStringOpr) {
//             if (r.startsWith(oprString)) {
//                 return [new OperationExpression(operator,
//                     parseExpr(code.slice(0, i).trim()),
//                     parseExpr(code.slice(i + oprString.length).trim())
//                 )]
//             }
//         }
//     }
// }

export function forEachScopedExprOnDelim(code: string, delim: string, lambda: (s: string, i: number) => boolean | void) {
    let lastDelimIndex = 0
    let exprLevel = 0
    for (let i = 0; i < code.length; i++) {
        const char = code.charAt(i)
        if      (char === '{' || char === '(' || char === '[') exprLevel++
        else if (char === '}' || char === ')' || char === ']') exprLevel--

        if ((char === delim && exprLevel === 0) || i === code.length - 1) {
            if (i === code.length - 1) i++
            let expr = code.slice(lastDelimIndex, i).trim()
            if (expr.endsWith(delim)) expr = expr.slice(0, -delim.length).trim()
            lastDelimIndex = i + 1
            if (lambda(expr, i)) break
        }
    }
}

export function parseExpr(code: string): Expression {
    const compound = new CompoundExpression
    if ((code.startsWith('{') && code.endsWith('}')) || (code.startsWith('(') && code.endsWith(')')))
        code = code.slice(1, -1).trim()

    forEachScopedExprOnDelim(code, ';', expr => {
        compound.AddExpressions(tokenizeExpr(expr))
    })

    return compound.Simplify()
}

function tokenizeExpr(expr: string): Expression[] {

    const tokens = (/^([_A-Za-z]+[-\w]*)(.*)$/g).exec(expr)
    
    let keyword = tokens?.at(1) ?? expr
    let rest = tokens?.at(2)?.trim() || undefined

    if (keyword === 'asm') {
        return [new AsmExpression(rest)]
    }
    else if (keyword === 'class') {
        return [new ClassExpression(rest)]
    }
    else if (keyword === 'let') {
        const decl = new DeclarationExpression(rest)
        return (decl.Initializer) ? [decl, decl.Initializer] : [decl]
    }
    else if (keyword === 'func') {
        return [new FuncExpression(rest)]
    }
    else if (keyword === 'if') {
        return [new IfExpression(rest)]
    }
    else if (keyword === 'include') {
        return IncludeExpression(rest, FileDir)
    }
    else if (keyword === 'operator') {
        return [new OperatorOverloadExpression(rest)]
    }
    else if (keyword === 'return') {
        return [new ReturnExpression(rest)]
    }
    else if (keyword === 'struct') {
        return [new StructExpression(rest)]
    }
    else if (keyword === 'while') {
        return [new WhileExpression(rest)]
    }
    else if (keyword.RegexTest(/^\d+$/g) && rest === undefined) {
        return [new LiteralExpression(keyword.toInt())]
    }
    else if (keyword.RegexTest(/^0x[\dA-Fa-f]+$/g) && rest === undefined) {
        return [new LiteralExpression(keyword.slice(2).toInt(16))]
    }
    else if (isValidIdentifier(keyword) && rest === undefined) {
        return [new VariableExpression(keyword)]
    }
    else if (isValidIdentifier(keyword) && rest?.startsWith('(')) {
        return [new FuncCallExpression(expr)]
    }
    else {
        let parenDepth = 0
        for (let i = expr.length - 1; i >= 0; i--) {
            const char = expr.charAt(i)
            if (char === '(') parenDepth++
            else if (char === ')') parenDepth--
            else if (parenDepth !== 0) continue
            //check before endsWith??
            const r = expr.slice(0, i + 1)
            for (const [oprString, operator] of operatorMapStringOpr) {
                if (r.endsWith(oprString)) {
                    const operand1 = expr.slice(0, i + 1 - oprString.length).trim()
                    const operand2 = expr.slice(i + 1).trim()

                    return [new OperationExpression(operator,
                        parseExpr(operand1 || operand2),
                        (operand2 ? parseExpr(operand2) : undefined)
                    )]
                }
            }
        }
        throw new LexerError('could not understand' + expr)
    }
}