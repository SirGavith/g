import fs from 'fs'
import { Assemble, AssemblerError } from './Assembler'

// Assemble Current File
const args = process.argv.slice(2)
const inFileName = args[0]
if (!inFileName.endsWith('.ga') && !inFileName.endsWith('.gassembly')) throw new AssemblerError('Can only assemble .ga or .gassembly files')

const outFileName = inFileName.slice(0, -1) + 'bin'

let lines = fs.readFileSync(inFileName, 'utf8')
    .replaceAll('\r', '')

const storage = Assemble(lines, args[1])

fs.writeFile(outFileName, storage, err => { if (err) console.log(err) })