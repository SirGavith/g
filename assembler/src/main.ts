import fs from 'fs'
import { Assemble, AssemblerError } from './Assembler'

// Assemble Current File
const inFileName = process.argv.at(-1)!
if (!inFileName.endsWith('.s')) throw new AssemblerError('Can only assemble .s files')

const outFileName = inFileName.slice(0, -1) + 'bin'

let lines = fs.readFileSync(inFileName, 'utf8')
            .replaceAll('\r', '')

const rom = Assemble(lines)

fs.writeFile(outFileName, rom, err => { if (err) console.log(err) })
