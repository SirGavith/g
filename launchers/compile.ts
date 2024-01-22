import fs from 'fs'
import { Lexer, } from '../lexer/lexer'
import { Compile, } from '../compiler/compiler'
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

const AST = Lexer(file)

// AST.Log()

console.log(Console.Cyan + `Lexed` + Console.Reset)
console.log(Console.Cyan + 'Compiling', Console.Reset)

Compile(AST)

// // Read File
// let assembly = fs.readFileSync(inFilePath, 'utf8').replaceAll('\r', '')

// // Assemble File
// const [ROM, codeLength] = Assemble(assembly, inFileDir)

// // Write binary
// const outFilePath = inFilePath.slice(0, -2) + 'gbin'
// fs.writeFileSync(outFilePath, ROM)

// console.log(Console.Cyan + `Assembled ${codeLength} bytes. Written to:`, Console.Reset, outFilePath.split('/').slice(-1)[0])