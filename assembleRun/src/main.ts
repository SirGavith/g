import { Assemble } from '../../assembler/src/Assembler'
import { Emu6502 } from '../../emulator/src/Emulator'
import fs from 'fs'

//Assemble and run current file

const args = process.argv.slice(2)
const fileName = args[0]
if (!fileName.endsWith('.ga')) throw new Error('Can only assemble .ga or files')

let lines = fs.readFileSync(fileName, 'utf8')
    .replaceAll('\r', '')

const storage = Assemble(lines, args[1])

fs.writeFile(fileName.slice(0, -2) + 'gbin',
    storage, err => { if (err) console.log(err) })

const cpu = new Emu6502()

cpu.Storage = storage

cpu.Execute()