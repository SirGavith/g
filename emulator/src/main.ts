import fs from 'fs'
import { Emu6502, RuntimeError } from './Emulator'

// Emulate Current File
const inFileName = process.argv[2]
if (!inFileName.endsWith('.bin')) throw new RuntimeError('Can only emulate .bin files')


let lines = fs.readFileSync(inFileName)

const cpu = new Emu6502()

cpu.Storage = lines

cpu.Execute()