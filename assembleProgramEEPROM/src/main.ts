import { execSync, spawn, spawnSync } from 'child_process';
import { Assemble } from '../../assembler/src/Assembler'
import fs from 'fs'
import path from 'path';

//Assemble current file and program to eeprom

const loadStartTime = process.hrtime();

const args = process.argv.slice(2)
const assemblyFilePath = args[0]
if (!assemblyFilePath.endsWith('.ga')) throw new Error('Can only assemble .ga or files')

let lines = fs.readFileSync(assemblyFilePath, 'utf8')
    .replaceAll('\r', '')

const ROM = Assemble(lines, args[1])

fs.writeFileSync(assemblyFilePath.slice(0, -2) + 'gbin', ROM)

console.log(ROM)

const machineCode = []

let i = 0;
for (; i < 0x8000; i++) {
    machineCode.push(ROM[i])
    if (i > 10 && machineCode.slice(-10, -1).every(v => v === 0)) break
}

console.log(machineCode)
const byteArrayString = machineCode.slice(0, -8).map(a => '0x' + a.toString(16)).join(',')
console.log(byteArrayString)

//patch into arduino code
console.log('Patching Arduino Code')

const arduinoCodePath = path.join(__dirname, '../../../main.ino')
const arduinoCodeOutPath = path.join(__dirname, '../../../core/core.ino')

const arduinoCode = fs.readFileSync(arduinoCodePath, 'utf-8')
const newArduinoCode = arduinoCode.replace('const byte data[] = {};', `const byte data[] = { ${byteArrayString} };`)
fs.writeFileSync(arduinoCodeOutPath, newArduinoCode)

console.log('Compiling Arduino Code')



// const ls = spawn('ls', ['-lh', '/usr']);

// Arduino CLI commands
const compileCommand = `arduino-cli compile --fqbn arduino:avr:uno ${arduinoCodeOutPath}`;
const uploadCommand = `arduino-cli upload -p COM3 --fqbn arduino:avr:uno ${arduinoCodeOutPath}`;
const monitorCommand = 'arduino-cli monitor -p COM3 --config baudrate=57600';

try {
    // Execute arduino-cli compile command
    console.log('Compiling...');
    execSync(compileCommand, { stdio: 'inherit' });

    // Execute arduino-cli upload command
    console.log('Uploading...');
    execSync(uploadCommand, { stdio: 'inherit' });

    // Execute arduino-cli monitor command
    console.log('Monitoring...');
    execSync(monitorCommand, { stdio: 'inherit' });

} catch (error) {
    console.error('Error:', (error as Error).message);
}