import fs from 'fs'
import { Assemble, AssemblerError } from '../assembler/assembler'
import * as Console from 'glib/dist/Console'


// Assemble Current File
const [inFilePath, inFileDir] = process.argv.slice(2)
if (!inFilePath.endsWith('.ga') && !inFilePath.endsWith('.gassembly'))
    throw new AssemblerError('Can only assemble .ga or .gassembly files')

console.log(Console.Cyan + 'Assembling', Console.Reset, inFilePath.split('/').slice(-1)[0])

// Read File
let assembly = fs.readFileSync(inFilePath, 'utf8').replaceAll('\r', '')

// Assemble File
const [ROM, codeLength] = Assemble(assembly, inFileDir)

const emptyBuffer = Buffer.alloc(0x8000, 0)

// Write binary
const outFilePath = inFilePath.slice(0, -2) + 'gbin'
// fs.writeFileSync(outFilePath, Buffer.concat([emptyBuffer, ROM]))
fs.writeFileSync(outFilePath, ROM)

console.log(Console.Cyan + `Assembled ${codeLength} bytes. Written to:`, Console.Reset, outFilePath.split('/').slice(-1)[0])