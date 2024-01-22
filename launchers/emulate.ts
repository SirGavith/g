import fs from 'fs'
import { Emu6502, RuntimeError } from '../emulator/emulator'
import * as Console from 'glib/dist/Console'

// Emulate Current File
const inFileName = process.argv[2]
if (!inFileName.endsWith('.gbin')) throw new RuntimeError('Can only emulate .gbin files')

let storage = fs.readFileSync(inFileName)

const cpu = new Emu6502()

cpu.Storage = new Uint8Array(0x10000)
storage.copy(cpu.Storage)

const exitCode = cpu.Execute()
console.log(`Exited with code ${exitCode}`)
