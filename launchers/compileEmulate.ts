import fs from 'fs'
import { Lexer, } from '../lexer/lexer'
import { Compile, } from '../compiler/compiler'
import * as Console from 'glib/dist/Console'
import { Extensions } from 'glib'
import { exit } from 'process'
import { Assemble } from '../assembler/assembler'
import { Emu6502 } from '../emulator/emulator'
Extensions.init()



const loadStartTime = process.hrtime();

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

const lexTime = process.hrtime(loadStartTime)
console.log(Console.Cyan + `Lexed ${code.split('\n').length} lines in ${lexTime[0]}s ${lexTime[1] / 10 ** 6}ms` + Console.Reset)
console.log(Console.Cyan + 'Compiling ...', Console.Reset)
const compStartTime = process.hrtime();


// Compile AST
const assembly = Compile(AST, inFileDir, true).join('\n')

// Write assembly
const assemblyoutFilePath = inFilePath.slice(0, -1) + 'ga'
fs.writeFileSync(assemblyoutFilePath, assembly)

const compTime = process.hrtime(compStartTime)
console.log(Console.Cyan + `Compiled in ${compTime[0]}s ${compTime[1] / 10 ** 6}ms. Written to:`, Console.Reset, assemblyoutFilePath.split('/').slice(-1)[0])
console.log(Console.Cyan + 'Assembling', Console.Reset, inFilePath.split('/').slice(-1)[0])
const assmStartTime = process.hrtime();


// Assemble File
const [ROM, codeLength] = Assemble(assembly, inFileDir)

// Write binary
const outFilePath = inFilePath.slice(0, -1) + 'gbin'
fs.writeFileSync(outFilePath, ROM)

const assmTime = process.hrtime(assmStartTime)
console.log(Console.Cyan + `Assembled ${codeLength} bytes in ${assmTime[0]}s ${assmTime[1] / 10 ** 6}ms. Written to:`, Console.Reset, assemblyoutFilePath.split('/').slice(-1)[0])

// Load Emulator
const cpu = new Emu6502()
cpu.Debug = true
cpu.Storage = new Uint8Array(0x10000)
ROM.copy(cpu.Storage, 0x8000)


const runStartTime = process.hrtime();

// Execute program
const exitCode = cpu.Execute()

const runTime = process.hrtime(runStartTime)
console.log(`Exited with code ${exitCode}`)
console.log(`Ran in ${runTime[0]}s ${runTime[1] / 10 ** 6}ms`)