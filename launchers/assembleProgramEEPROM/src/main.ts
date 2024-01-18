import { execSync } from 'child_process';
import { Assemble, AssemblerError } from '../../../../assembler/src/Assembler'
import * as Console from '../../../../shared/Console'
import fs from 'fs'
import path from 'path';

// Assemble Current File and Program to EEPROM


// Find Current File
const [inFilePath, inFileDir] = process.argv.slice(2)
if (!inFilePath.endsWith('.ga') && !inFilePath.endsWith('.gassembly')) {
    throw new AssemblerError('Can only assemble .ga files')
}

console.log(Console.Cyan + 'Assembling', Console.Reset, inFilePath.split('/').slice(-1)[0])

// Read File
let assembly = fs.readFileSync(inFilePath, 'utf8').replaceAll('\r', '')

// Assemble File
const [ROM, codeLength] = Assemble(assembly, inFileDir)
console.log(ROM, codeLength)

// Write binary (for debugging)
const outFilePath = inFilePath.slice(0, -2) + 'gbin'
fs.writeFileSync(outFilePath, ROM)

console.log(Console.Cyan + `Assembled ${codeLength} bytes. Written to:`, Console.Reset, outFilePath.split('/').slice(-1)[0])

// assembler produces byte[0x8000]; we can only include a little bit of bytecode in the arduino file
// ideal is to stream that to arduino on serial, but that is hard

// Stringify machine code part of ROM
const machineCode = []
for (let i = 0; i < codeLength; i++) {
    machineCode[i] = '0x' + ROM[i].toString(16)
}

console.log(machineCode.join(' '))

// Patch into arduino code
console.log(Console.Cyan + 'Patching...', Console.Reset)

const arduinoCodePath = path.join(__dirname, '../../../main.ino')
const arduinoCodeOutPath = path.join(__dirname, '../../../core/core.ino')

let arduinoCode = fs.readFileSync(arduinoCodePath, 'utf-8')
arduinoCode = arduinoCode.replace('const byte data[] = {};', `const byte data[] = { ${machineCode.join(',') } };`)

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