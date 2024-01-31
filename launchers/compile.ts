import fs from 'fs'
import { Lexer, } from '../lexer/lexer'
import { Compile, } from '../compiler/compiler'
import * as Console from 'glib/dist/Console'
import { Extensions } from 'glib'
import { exit } from 'process'
Extensions.init()



// Lex Current File
const [inFilePath, inFileDir] = process.argv.slice(2)
if (!inFilePath.endsWith('.g')) {
    console.log('Can only compile .g files')
    exit(1)
}

console.log(Console.Cyan + 'Lexing', Console.Reset, inFilePath.split('/').slice(-1)[0])

// Read Code
let code = fs.readFileSync(inFilePath, 'utf8').replaceAll('\r', '')

// Lex Code
const AST = Lexer(code, inFileDir, true)

// AST.Log()

console.log(Console.Cyan + `Lexed ${code.split('\n').length} lines` + Console.Reset)
console.log(Console.Cyan + 'Compiling', Console.Reset)


// Compile AST
const assembly = Compile(AST, inFileDir, true).join('\n')


// Write binary
const outFilePath = inFilePath.slice(0, -1) + 'ga'
fs.writeFileSync(outFilePath, assembly)

console.log(Console.Cyan + `Compiled. Written to:`, Console.Reset, outFilePath.split('/').slice(-1)[0])