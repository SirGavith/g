import { Expression, ExpressionTypes } from "./Expressions"
import { LexerError, Lexer } from "../../lexer/lexer"
import * as Console from 'glib/dist/Console'
import * as fs from 'fs'
import path from "path"

export function IncludeExpression(rest: string | undefined, fileDir: string): Expression[] {
    if (rest === undefined)
        throw new LexerError('include must have a body')

    const filePath = path.join(fileDir, rest)
    console.log()


    const file = fs.readFileSync(filePath, 'utf-8').replaceAll('\r', '')
    const exp = Lexer(file, fileDir)
    if (exp.ExpressionType === ExpressionTypes.Compound)
        return exp.Children
    return [exp]
}