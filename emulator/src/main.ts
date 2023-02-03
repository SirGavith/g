import fs from 'fs'
import { Emu6502, RuntimeError } from './Emulator'

// Emulate Current File
const inFileName = process.argv[2]
if (!inFileName.endsWith('.gbin')) throw new RuntimeError('Can only emulate .gbin files')

let storage = fs.readFileSync(inFileName)

const cpu = new Emu6502()

cpu.Storage = storage

cpu.Execute()