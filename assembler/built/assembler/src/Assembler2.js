"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Assemble = exports.AssemblerError = void 0;
const Constants_1 = require("../../shared/src/Constants");
class CustomError extends Error {
    constructor(...message) { super(message.map(m => String(m)).join(' ')); this.name = this.constructor.name; }
}
class AssemblerError extends CustomError {
    constructor(...message) { super(message); this.name = this.constructor.name; }
}
exports.AssemblerError = AssemblerError;
function ParseNumber(number) {
    let n = number.trim();
    let int = null;
    if (n.startsWith('$')) { // hex
        int = Number.parseInt(n.slice(1), 16);
    }
    else if (n.startsWith('%')) { // bin
        int = Number.parseInt(n.slice(1), 2);
    }
    else { // dec
        int = Number.parseInt(n, 10);
    }
    if (int === null || Number.isNaN(int))
        throw new AssemblerError(`Could not parse number '${number}'`);
    return int;
}
function IsValidIdentifier(s) {
    return /^\w[-\w\d]*$/.test(s);
}
function RemoveSpaces(s) {
    return s.replaceAll(' ', '');
}
function Assemble(rawAssembly) {
    const machineCode = new Uint8Array(0x10000);
    //do a thing
    // Split and remove comments
    const assembly = rawAssembly
        .split('\n')
        .map((l, i) => {
        const commentIndex = l.indexOf('//');
        if (commentIndex !== -1)
            return [l.slice(0, commentIndex).trim(), i + 1];
        return [l.trim(), i + 1];
    })
        .filter(l => l[0] !== '');
    //Keep set of all identifiers for dupe-checking
    const allIdentifiers = new Set();
    // Mapping between alloc identifiers and their memory positions
    const allocMapping = new Map();
    {
        let nextAvailableAllocByte = 0x0200;
        assembly
            .filter(l => l[0].startsWith('alloc '))
            .forEach(([l, originalIndex]) => {
            const [identifier, position] = l.slice(6).split(':').map(s => s.trim());
            if (identifier === undefined || identifier === '')
                throw new AssemblerError(`Alloc on line ${originalIndex} has no identifier`);
            if (!IsValidIdentifier(identifier))
                throw new AssemblerError(`Alloc on line ${originalIndex} has an illegal identifier`);
            if (allIdentifiers.has(identifier))
                throw new AssemblerError(`Duplicate identifier ${identifier} on line ${originalIndex}`);
            allIdentifiers.add(identifier);
            if (position !== undefined) {
                // Manually-allocated position
                const pos = ParseNumber(position);
                allocMapping.set(identifier, pos);
            }
            else {
                // Auto-allocated
                allocMapping.set(identifier, nextAvailableAllocByte);
                nextAvailableAllocByte += 1;
            }
        });
    }
    // Mapping between define identifiers and their definitions
    const defineMapping = new Map();
    {
        assembly
            .filter(l => l[0].startsWith('define '))
            .forEach(([l, originalIndex]) => {
            const [identifier, value] = l.slice(7).split(':')
                .map(s => s.trim());
            if (identifier === '')
                throw new AssemblerError(`Define on line ${originalIndex} has no identifier`);
            if (!IsValidIdentifier(identifier))
                throw new AssemblerError(`Define on line ${originalIndex} has an illegal identifier`);
            if (value === '')
                throw new AssemblerError(`Define on line ${originalIndex} has no value`);
            if (allIdentifiers.has(identifier))
                throw new AssemblerError(`Duplicate identifier ${identifier} on line ${originalIndex}`);
            const v = ParseNumber(value);
            if (v >= 0x100)
                throw new AssemblerError(`Define on line ${originalIndex} has value over 255; Immidiates must be only a byte`);
            allIdentifiers.add(identifier);
            defineMapping.set(identifier, v);
        });
    }
    // List of label identifiers, we don't yet know thier positions
    const labels = new Set();
    {
        assembly.filter(l => l[0].startsWith('@'))
            .forEach(([l, originalIndex]) => {
            const identifier = l.slice(1).trim();
            if (identifier === '')
                throw new AssemblerError(`Label on line ${originalIndex} is empty`);
            if (!IsValidIdentifier(identifier))
                throw new AssemblerError(`Label on line ${originalIndex} has an illegal identifier`);
            if (allIdentifiers.has(identifier))
                throw new AssemblerError(`Duplicate identifier ${identifier} on line ${originalIndex}`);
            allIdentifiers.add(identifier);
            labels.add(identifier);
        });
    }
    const labelJumpReferences = []; // identifier, position of opcode
    const labelBranchReferences = []; // identifier, position of opcode
    let nextAvailableCodeByte = 0x8000;
    const labelDefinitions = new Map();
    //Loop through each line of assembly
    for (const [line, originalIndex] of assembly) {
        if (line.startsWith('alloc '))
            continue;
        if (line.startsWith('define '))
            continue;
        if (line.startsWith('@')) { // label
            const identifier = line.slice(1).split(' ')[0].trim();
            labelDefinitions.set(identifier, nextAvailableCodeByte);
            continue;
        }
        const [instruction, operand] = line.split(' ').map(s => RemoveSpaces(s)); // TODO split onyl at first space
        if (!Constants_1.InstructionOpcodes.has(instruction))
            throw new AssemblerError(`Cannot understand line ${originalIndex} '${line}'`);
        // Lines is an instruction
        // instructionSignatures is a map of all the possible addressModes to their opcodes
        const instructionSignatures = Constants_1.InstructionOpcodes.get(instruction);
        // Determine addressMode and instructionLength
        let instructionLength = undefined;
        let addressMode = undefined;
        if (labels.has(operand)) {
            // operand is a label
            if (instruction === 'JMP') { //TODO move labels.has so it works with indirect
                instructionLength = 3;
                let label = operand;
                if (operand.startsWith('(') && operand.endsWith(')')) {
                    label = operand.slice(1, -1);
                    addressMode = Constants_1.AddressModes.Indirect;
                }
                else
                    addressMode = Constants_1.AddressModes.Absolute;
                labelJumpReferences.push([label, nextAvailableCodeByte]);
            }
            else if (instruction === 'JSR') {
                labelJumpReferences.push([operand, nextAvailableCodeByte]);
                instructionLength = 3;
                addressMode = Constants_1.AddressModes.Absolute;
            }
            else if (Constants_1.BranchInstructions.includes(instruction)) {
                // branch
                labelBranchReferences.push([operand, nextAvailableCodeByte]);
                instructionLength = 2;
                addressMode = Constants_1.AddressModes.ZeropageRelative;
            }
            else
                throw new AssemblerError(`Labels can only be used of JMP, JSR and Branch instructions ${originalIndex}`);
        }
        else { //not a label, write operand
            let operandValue = undefined;
            //null is no operand; undefined is not yet defined
            if (operand === undefined) {
                if (!instructionSignatures.has(Constants_1.AddressModes.Implied)) {
                    throw new AssemblerError(`Instruction ${instruction} has no implied address mode`);
                }
                instructionLength = 1;
                addressMode = Constants_1.AddressModes.Implied;
                operandValue = null;
            }
            else if (operand.startsWith('(')) {
                let opr;
                if (operand.endsWith(',X)')) {
                    instructionLength = 2;
                    addressMode = Constants_1.AddressModes.IndirectX;
                    opr = operand.slice(1, -3);
                }
                else if (operand.endsWith('),Y')) {
                    instructionLength = 2;
                    addressMode = Constants_1.AddressModes.IndirectY;
                    opr = operand.slice(1, -3);
                }
                else if (operand.endsWith(')')) {
                    instructionLength = 3;
                    addressMode = Constants_1.AddressModes.Indirect;
                    opr = operand.slice(1, -1);
                }
                else
                    throw new AssemblerError(`Could not understand operand ${operand} on line ${originalIndex}`);
                operandValue = allocMapping.has(opr) ?
                    allocMapping.get(operand) :
                    ParseNumber(opr);
            }
            else if (operand.startsWith('#')) {
                const n = ParseNumber(operand.slice(1));
                addressMode = Constants_1.AddressModes.Immediate;
                instructionLength = 2;
                operandValue = n;
            }
            else if (operand.endsWith(',X')) {
                const opr = operand.slice(0, -2);
                operandValue = allocMapping.has(opr) ?
                    allocMapping.get(operand) :
                    ParseNumber(opr);
                if (operandValue < 0x100) {
                    addressMode = Constants_1.AddressModes.ZeropageX;
                    instructionLength = 2;
                }
                else {
                    addressMode = Constants_1.AddressModes.AbsoluteX;
                    instructionLength = 3;
                }
            }
            else if (operand.endsWith(',Y')) {
                const opr = operand.slice(0, -2);
                operandValue = allocMapping.has(opr) ?
                    allocMapping.get(operand) :
                    ParseNumber(opr);
                if (operandValue < 0x100) {
                    addressMode = Constants_1.AddressModes.ZeropageY;
                    instructionLength = 2;
                }
                else {
                    addressMode = Constants_1.AddressModes.AbsoluteY;
                    instructionLength = 3;
                }
            }
            else if (allocMapping.has(operand)) {
                operandValue = allocMapping.get(operand);
                if (operandValue < 0x100) {
                    addressMode = Constants_1.AddressModes.ZeropageRelative;
                    instructionLength = 2;
                }
                else {
                    addressMode = Constants_1.AddressModes.Absolute;
                    instructionLength = 3;
                }
            }
            else if (defineMapping.has(operand)) {
                const m = defineMapping.get(operand);
                if (!instructionSignatures.has(Constants_1.AddressModes.Immediate))
                    throw new AssemblerError(`Definitions only work as immidiate values; line ${originalIndex}`);
                addressMode = Constants_1.AddressModes.Immediate;
                instructionLength = 2;
                operandValue = m;
            }
            else {
                const n = ParseNumber(operand);
                if (n < 0x100) {
                    addressMode = Constants_1.AddressModes.ZeropageRelative;
                    instructionLength = 2;
                }
                else {
                    addressMode = Constants_1.AddressModes.Absolute;
                    instructionLength = 3;
                }
                operandValue = n;
            }
            if (instructionLength === undefined || addressMode === undefined || operandValue === undefined)
                throw new Error;
            if (!instructionSignatures.has(addressMode))
                throw new AssemblerError(`Instruction ${instruction} does not have the address mode ${Constants_1.AddressModes[addressMode]} (line ${originalIndex})`);
            if (operandValue === null && instructionLength !== 1)
                throw new Error;
            if (operandValue !== null) {
                if (operandValue >= 0x100 && instructionLength < 3)
                    throw new AssemblerError(`Instruction ${instruction} is only a byte, ${operandValue} is too big (line ${originalIndex})`);
                if (operandValue >= 0x10000)
                    throw new AssemblerError(`Instruction ${instruction} is only two bytes, ${operandValue} is too big (line ${originalIndex})`);
                machineCode[nextAvailableCodeByte + 1] = operandValue & 0xFF;
                if (operandValue >= 0x100) {
                    machineCode[nextAvailableCodeByte + 2] = (operandValue & 0xFF00) >> 8;
                }
            }
        }
        machineCode[nextAvailableCodeByte] = instructionSignatures.get(addressMode);
        nextAvailableCodeByte += instructionLength;
    }
    //Apply label mappings for jump and branch
    for (const [identifier, opcodePosition] of labelJumpReferences) { // TODO keep line numbers along to here for error
        const labelPos = labelDefinitions.get(identifier);
        if (labelPos === undefined)
            throw new Error;
        machineCode[opcodePosition + 1] = labelPos & 0xFF;
        machineCode[opcodePosition + 2] = (labelPos & 0xFF00) >> 8;
    }
    for (const [identifier, opcodePosition] of labelBranchReferences) { // TODO keep line numbers along to here for error
        const labelPos = labelDefinitions.get(identifier);
        if (labelPos === undefined)
            throw new Error;
        const relativePosition = labelPos - (opcodePosition + 2);
        if (relativePosition >= 128 || relativePosition < -128) {
            throw new AssemblerError(`Branch relative position is too high; identifier is ${identifier}`);
        }
        // 8-bit signed (twos compliment)
        machineCode[opcodePosition + 1] = relativePosition & 0xFF;
    }
    machineCode[Constants_1.ResetVector_HI] = 0x80;
    machineCode[Constants_1.ResetVector_LO] = 0x00;
    return machineCode;
}
exports.Assemble = Assemble;
