import { execSync } from 'child_process';
import { Assemble } from '../../assembler/src/Assembler'
import * as Console from '../../shared/Console'
import fs from 'fs'
import path from 'path';

// Assemble Current File and Program to EEPROM


// Find Current File
const [assemblyFilePath, assemblyFileDir] = process.argv.slice(2)
if (!assemblyFilePath.endsWith('.ga')) {
    throw new Error('Can only assemble .ga files')
}
console.log(Console.Cyan + 'Assembling', Console.Reset, assemblyFilePath.split('/').slice(-1)[0])

// Read File
let assembly = fs.readFileSync(assemblyFilePath, 'utf8').replaceAll('\r', '')

// Assemble File
const ROM = Assemble(assembly, assemblyFileDir)

// Write binary (for debugging)
const binFilePath = assemblyFilePath.slice(0, -2) + 'gbin'
fs.writeFileSync(binFilePath, ROM)
console.log(Console.Cyan + 'Assembled. Written to:', Console.Reset, binFilePath.split('/').slice(-1)[0])

// assembler produces byte[0x8000]; we can only include a little bit of bytecode in the arduino file
// ideal is to stream that to arduino on serial, but that is hard


// Find code part of bin by looking for 10 consecutive 0s
const machineCode = []
let i = 0;
for (; i < 0x8000; i++) {
    machineCode.push(ROM[i])
    if (i > 10 && machineCode.slice(-10, -1).every(v => v === 0)) break
}

const byteArrayString = machineCode.slice(0, -8).map(a => '0x' + a.toString(16)).join(',')
console.log(machineCode.slice(0, -8).map(a => a.toString(16)).join(' '))

// Patch into arduino code
console.log(Console.Cyan + 'Patching...', Console.Reset)

const arduinoCodePath = path.join(__dirname, '../../../main.ino')
const arduinoCodeOutPath = path.join(__dirname, '../../../core/core.ino')

let arduinoCode = fs.readFileSync(arduinoCodePath, 'utf-8')
arduinoCode = arduinoCode.replace('const byte data[] = {};', `const byte data[] = { ${byteArrayString} };`)

fs.writeFileSync(arduinoCodeOutPath, arduinoCode)

// Arduino CLI commands
const compileCommand = `arduino-cli compile --fqbn arduino:avr:uno ${arduinoCodeOutPath}`;
const uploadCommand = `arduino-cli upload -p COM3 --fqbn arduino:avr:uno ${arduinoCodeOutPath}`;
const monitorCommand = 'arduino-cli monitor -p COM3 --config baudrate=57600';

try {
    // Compile Arduino code
    console.log(Console.Cyan + 'Compiling...', Console.Reset);
    execSync(compileCommand, { stdio: 'inherit' });

    // Upload Arduino code
    console.log(Console.Cyan + 'Uploading...', Console.Reset);
    execSync(uploadCommand, { stdio: 'inherit' });

    // Monitor Arduino output
    console.log(Console.Cyan + 'Monitoring...', Console.Reset);
    execSync(monitorCommand, { stdio: 'inherit' });

} catch (error) {
    console.error('Error:', (error as Error).message);
}