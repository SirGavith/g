import fs from 'fs'
import { Lexer, LexerError } from '../lexer/lexer'
import * as Console from 'glib/dist/Console'
import { Extensions } from 'glib'
Extensions.init()


//TEMPLATE FILE

// Assemble Current File
const [inFilePath, inFileDir] = process.argv.slice(2)
if (!inFilePath.endsWith('.g') && !inFilePath.endsWith('.gassembly'))
    throw new LexerError('Can only assemble .ga or .gassembly files')



console.log(Console.Cyan + 'Lexing', Console.Reset, inFilePath.split('/').slice(-1)[0])


// Read File
let code = fs.readFileSync(inFilePath, 'utf8').replaceAll('\r', '')

// Assemble File
const expression = Lexer(code)

console.dir(expression)

// Write binary
// const outFilePath = inFilePath.slice(0, -2) + 'gbin'
// fs.writeFileSync(outFilePath, ROM)

console.log(Console.Cyan + `Lexed` + Console.Reset)