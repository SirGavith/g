import { Assemble } from '../../assembler/src/Assembler'
import { Emu6502 } from '../../emulator/src/Emulator'
import fs from 'fs'

//Assemble and run current file

const loadStartTime = process.hrtime();

const args = process.argv.slice(2)
const fileName = args[0]
if (!fileName.endsWith('.ga')) throw new Error('Can only assemble .ga or files')

let lines = fs.readFileSync(fileName, 'utf8')
    .replaceAll('\r', '')

const ROM = Assemble(lines, args[1])

fs.writeFileSync(fileName.slice(0, -2) + 'gbin', ROM)

const cpu = new Emu6502()

cpu.Storage = new Uint8Array(0x10000)
ROM.copy(cpu.Storage, 0x8000)


const loadTime = process.hrtime(loadStartTime)
console.log(`Loaded in ${loadTime[0]}s ${loadTime[1] / 10 ** 6}ms`)
const runStartTime = process.hrtime();

cpu.Debug = true

cpu.Execute()

const runTime = process.hrtime(runStartTime)
console.log(`Ran in ${runTime[0]}s ${runTime[1] / 10 ** 6}ms`)