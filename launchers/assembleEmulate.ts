import fs from 'fs'
import { Assemble, AssemblerError } from '../assembler/assembler'
import { Emu6502 } from '../emulator/emulator'
import * as Console from 'glib/dist/Console'

//Assemble and run current file
const loadStartTime = process.hrtime();
const [inFilePath, inFileDir] = process.argv.slice(2)
if (!inFilePath.endsWith('.ga') && !inFilePath.endsWith('.gassembly'))
    throw new AssemblerError('Can only assemble .ga or .gassembly files')

console.log(Console.Cyan + 'Assembling', Console.Reset, inFilePath.split('/').slice(-1)[0])

// Read File
let assembly = fs.readFileSync(inFilePath, 'utf8').replaceAll('\r', '')

// Assemble File
const [ROM, codeLength] = Assemble(assembly, inFileDir)

// Write binary
const outFilePath = inFilePath.slice(0, -2) + 'gbin'
fs.writeFileSync(outFilePath, ROM)

console.log(Console.Cyan + `Assembled ${codeLength} bytes. Written to:`, Console.Reset, outFilePath.split('/').slice(-1)[0])

// Load Emulator
const cpu = new Emu6502()
cpu.Debug = true
cpu.Storage = new Uint8Array(0x10000)
ROM.copy(cpu.Storage, 0x8000)


const loadTime = process.hrtime(loadStartTime)
console.log(`Loaded in ${loadTime[0]}s ${loadTime[1] / 10 ** 6}ms`)
const runStartTime = process.hrtime();

// Execute program
const exitCode = cpu.Execute()

const runTime = process.hrtime(runStartTime)
console.log(`Exited with code ${exitCode}`)
console.log(`Ran in ${runTime[0]}s ${runTime[1] / 10 ** 6}ms`)