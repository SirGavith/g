import fs from 'fs'
import { Lexer, LexerError } from '../lexer/lexer'
import * as Console from 'glib/dist/Console'
import { Extensions } from 'glib'
import { exit } from 'process'
Extensions.init()



// Lex Current File
const inFilePath = process.argv.slice(2)[0]
if (!inFilePath.endsWith('.g')) {
    console.log('Can only assemble .g files')
    exit(1)
}

console.log(Console.Cyan + 'Lexing', Console.Reset, inFilePath.split('/').slice(-1)[0])

let file = fs.readFileSync(inFilePath, 'utf8').replaceAll('\r', '')
{
    const expression = Lexer(file)
    console.dir(expression)
    throw new LexerError
}


console.log(Console.Cyan + `Lexed` + Console.Reset)