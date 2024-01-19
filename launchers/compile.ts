import fs from 'fs'
import { CompilerError } from '../compiler/compiler'
import { Lexer } from '../lexer/lexer'
import * as Console from 'glib/dist/Console'
import { Extensions } from 'glib'
Extensions.init()
//TEMPLATE



// Assemble Current File
const [inFilePath, inFileDir] = process.argv.slice(2)
if (!inFilePath.endsWith('.g'))
    throw new CompilerError('Can only assemble .ga or .gassembly files')

console.log(Console.Cyan + 'Compiling', Console.Reset, inFilePath.split('/').slice(-1)[0])
throw new CompilerError('not implemented yet')

// // Read File
// let assembly = fs.readFileSync(inFilePath, 'utf8').replaceAll('\r', '')

// // Assemble File
// const [ROM, codeLength] = Assemble(assembly, inFileDir)

// // Write binary
// const outFilePath = inFilePath.slice(0, -2) + 'gbin'
// fs.writeFileSync(outFilePath, ROM)

// console.log(Console.Cyan + `Assembled ${codeLength} bytes. Written to:`, Console.Reset, outFilePath.split('/').slice(-1)[0])