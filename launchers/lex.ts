import fs from 'fs'
import { Lexer, LexerError } from '../lexer/lexer'
import * as Console from 'glib/dist/Console'
import { Extensions } from 'glib'
import { exit } from 'process'
Extensions.init()



// Lex Current File
const [inFilePath, inFileDir] = process.argv.slice(2)
if (!inFilePath.endsWith('.g')) {
    console.log('Can only assemble .g files')
    exit(1)
}

console.log(Console.Cyan + 'Lexing', Console.Reset, inFilePath.split('/').slice(-1)[0])

let file = fs.readFileSync(inFilePath, 'utf8').replaceAll('\r', '')
{
    const expression = Lexer(file, inFileDir, true)
    console.dir(expression)
    expression.Log()
}


console.log(Console.Cyan + `Lexed` + Console.Reset)