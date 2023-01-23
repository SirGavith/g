import { AddressModes, BranchInstructions, InstructionOpcodes, JSRInstruction, JumpInstruction, ResetVector_HI, ResetVector_LO } 
    from "../../shared/Constants"

class CustomError extends Error {
    constructor(...message: any[]) { super(message.map(m => String(m)).join(' ')); this.name = this.constructor.name }
}
export class AssemblerError extends CustomError { constructor(...message: any[]) { super(message); this.name = this.constructor.name } }

type AssemblyLine = [string, number] // string, originalIndex

function ParseNumber(number: string): number {
    let n = number.trim()
    let int: number | null = null
    if (n.startsWith('$')) { // hex
        int = Number.parseInt(n.slice(1), 16)
    }
    else if (n.startsWith('%')) { // bin
        int = Number.parseInt(n.slice(1), 2)
    }
    else { // dec
        int = Number.parseInt(n, 10)
    }
    if (int === null || Number.isNaN(int))
        throw new AssemblerError(`Could not parse number '${number}'`)
    return int
}

function IsValidIdentifier(s: string): boolean {
    return /^\w[-\w\d]*$/.test(s)
}

function RemoveSpaces(s: string): string {
    return s.replaceAll(' ', '')
}

export function Assemble(rawAssembly: string): Uint8Array {
    const machineCode = new Uint8Array(0x10000)
    //do a thing
    // Split and remove comments
    const assembly: AssemblyLine[] = rawAssembly
        .split('\n')
        .map((l, i) => {
            const commentIndex = l.indexOf('//')
            if (commentIndex !== -1) 
                return [l.slice(0, commentIndex).trim(), i + 1] as AssemblyLine
            return [l.trim(), i + 1] as AssemblyLine
        })
        .filter(l => l[0] !== '')
    //Keep set of all identifiers for dupe-checking
    const allIdentifiers = new Set<string>()
    // Mapping between alloc identifiers and their memory positions
    const allocMapping = new Map<string, number>()
    {
        let nextAvailableAllocByte = 0x0200
        assembly
            .filter(l => l[0].startsWith('alloc '))
            .forEach(([l, originalIndex]) => {
                const [identifier, position] = l.slice(6).split(':').map(s => s.trim())

                if (identifier === undefined || identifier === '')
                    throw new AssemblerError(`Alloc on line ${originalIndex} has no identifier`)
                if (!IsValidIdentifier(identifier))
                    throw new AssemblerError(`Alloc on line ${originalIndex} has an illegal identifier`)
                if (allIdentifiers.has(identifier))
                    throw new AssemblerError(`Duplicate identifier ${identifier} on line ${originalIndex}`)
                
                allIdentifiers.add(identifier)
                if (position !== undefined) {
                    // Manually-allocated position
                    const pos = ParseNumber(position)
                    allocMapping.set(identifier, pos)
                }
                else {
                    // Auto-allocated
                    allocMapping.set(identifier, nextAvailableAllocByte)
                    nextAvailableAllocByte += 1
                }
            })
    }
    // Mapping between define identifiers and their definitions
    const defineMapping = new Map<string, number>()
    {
        assembly
            .filter(l => l[0].startsWith('define '))
            .forEach(([l, originalIndex]) => {
                const [identifier, value] = l.slice(7).split(':')
                    .map(s => s.trim())
                if (identifier === '')
                    throw new AssemblerError(`Define on line ${originalIndex} has no identifier`)
                if (!IsValidIdentifier(identifier))
                    throw new AssemblerError(`Define on line ${originalIndex} has an illegal identifier`)
                if (value === '')
                    throw new AssemblerError(`Define on line ${originalIndex} has no value`)
                if (allIdentifiers.has(identifier))
                    throw new AssemblerError(`Duplicate identifier ${identifier} on line ${originalIndex}`)
                const v = ParseNumber(value)
                if (v >= 0x100)
                    throw new AssemblerError(`Define on line ${originalIndex} has value over 255; Immidiates must be only a byte`)
                allIdentifiers.add(identifier)
                defineMapping.set(identifier, v)
            })
    }
    // List of label identifiers, we don't yet know thier positions
    const labels = new Set<string>()
    {
        assembly.filter(l => l[0].startsWith('@'))
            .forEach(([l, originalIndex]) => {
                const identifier = l.slice(1).trim()
                if (identifier === '')
                    throw new AssemblerError(`Label on line ${originalIndex} is empty`)
                if (!IsValidIdentifier(identifier))
                    throw new AssemblerError(`Label on line ${originalIndex} has an illegal identifier`)
                if (allIdentifiers.has(identifier))
                    throw new AssemblerError(`Duplicate identifier ${identifier} on line ${originalIndex}`)
                allIdentifiers.add(identifier)
                labels.add(identifier)
            })
    }

    const labelJumpReferences: [string, number][] = [] // identifier, position of opcode
    const labelBranchReferences: [string, number][] = [] // identifier, position of opcode

    let nextAvailableCodeByte = 0x8000
    const labelDefinitions = new Map<string, number>()
    //Loop through each line of assembly
    for (const [line, originalIndex] of assembly) {
        if (line.startsWith('alloc ')) continue
        if (line.startsWith('define ')) continue
        if (line.startsWith('@')) { // label
            const identifier = line.slice(1).split(' ')[0].trim()
            labelDefinitions.set(identifier, nextAvailableCodeByte)
            continue
        }
        const [instruction, operand] = line.split(/ (.*)/, 2).map(s => RemoveSpaces(s))
        if (!InstructionOpcodes.has(instruction)) 
            throw new AssemblerError(`Cannot understand line ${originalIndex} '${line}'`)
        // Lines is an instruction

        // instructionSignatures is a map of all the possible addressModes to their opcodes
        const instructionSignatures = InstructionOpcodes.get(instruction)!

        // Determine addressMode and instructionLength
        let instructionLength: number | undefined = undefined
        let addressMode: AddressModes | undefined = undefined
            // operand is a label

        if (instruction === JumpInstruction) {
            instructionLength = 3
            let label = operand
            if (operand.startsWith('(') && operand.endsWith(')')) {
                label = operand.slice(1, -1)
                addressMode = AddressModes.Indirect
            }
            else addressMode = AddressModes.Absolute

            if (!labels.has(label)) 
                throw new AssemblerError(`Instruction 'JMP' on line ${originalIndex} does not reference a label`)

            labelJumpReferences.push([label, nextAvailableCodeByte])
        }
        else if (instruction === JSRInstruction) {
            if (!labels.has(operand))
                throw new AssemblerError(`Instruction 'JSR' on line ${originalIndex} does not reference a label`)

            labelJumpReferences.push([operand, nextAvailableCodeByte])
            instructionLength = 3
            addressMode = AddressModes.Absolute
        } 
        else if (BranchInstructions.includes(instruction)) { // branch
            if (!labels.has(operand))
                throw new AssemblerError(`Instruction ${instruction} on line ${originalIndex} does not reference a label`)

            labelBranchReferences.push([operand, nextAvailableCodeByte])
            instructionLength = 2
            addressMode = AddressModes.ZeropageR
        }
        else { //not a label, write operand
            let operandValue: number | null | undefined = undefined
                //null is no operand; undefined is not yet defined

            if (operand === undefined) {
                if (!instructionSignatures.has(AddressModes.Implied)) {
                    throw new AssemblerError(`Instruction ${instruction} has no implied address mode`)
                }
                instructionLength = 1
                addressMode = AddressModes.Implied
                operandValue = null
            }
            else if (operand.startsWith('(')) {
                let opr: string
                if (operand.endsWith(',X)')) {
                    instructionLength = 2
                    addressMode = AddressModes.IndirectX
                    opr = operand.slice(1, -3)
                }
                else if (operand.endsWith('),Y')) {
                    instructionLength = 2
                    addressMode = AddressModes.IndirectY
                    opr = operand.slice(1, -3)
                }
                else if (operand.endsWith(')')) {
                    instructionLength = 3
                    addressMode = AddressModes.Indirect
                    opr = operand.slice(1, -1)
                }
                else throw new AssemblerError(`Could not understand operand ${operand} on line ${originalIndex}`)
                operandValue = allocMapping.has(opr) ?
                    allocMapping.get(operand)! :
                    ParseNumber(opr)
            }
            else if (operand.startsWith('#')) {
                const n = ParseNumber(operand.slice(1))
                addressMode = AddressModes.Immediate
                instructionLength = 2
                operandValue = n
            }
            else if (operand.endsWith(',X')) {
                const opr = operand.slice(0, -2)

                operandValue = allocMapping.has(opr) ? 
                    allocMapping.get(operand)! :
                    ParseNumber(opr)
                if (operandValue < 0x100) {
                    addressMode = AddressModes.ZeropageX
                    instructionLength = 2
                }
                else {
                    addressMode = AddressModes.AbsoluteX
                    instructionLength = 3
                }
            }
            else if (operand.endsWith(',Y')) {
                const opr = operand.slice(0, -2)

                operandValue = allocMapping.has(opr) ?
                    allocMapping.get(operand)! :
                    ParseNumber(opr)

                if (operandValue < 0x100) {
                    addressMode = AddressModes.ZeropageY
                    instructionLength = 2
                }
                else {
                    addressMode = AddressModes.AbsoluteY
                    instructionLength = 3
                }
            }
            else if (allocMapping.has(operand)) {
                operandValue = allocMapping.get(operand)!
                if (operandValue < 0x100) {
                    addressMode = AddressModes.ZeropageR
                    instructionLength = 2
                }
                else {
                    addressMode = AddressModes.Absolute
                    instructionLength = 3
                }
            }
            else if (defineMapping.has(operand)) {
                const m = defineMapping.get(operand)!
                if (!instructionSignatures.has(AddressModes.Immediate))
                    throw new AssemblerError(`Definitions only work as immidiate values; line ${originalIndex}`)
                addressMode = AddressModes.Immediate
                instructionLength = 2
                operandValue = m
            }
            else {
                const n = ParseNumber(operand)
                if (n < 0x100) {
                    addressMode = AddressModes.ZeropageR
                    instructionLength = 2
                }
                else {
                    addressMode = AddressModes.Absolute
                    instructionLength = 3
                }
                operandValue = n
            }

            if (instructionLength === undefined || addressMode === undefined || operandValue === undefined) throw new Error
            if (!instructionSignatures.has(addressMode))
                throw new AssemblerError(`Instruction ${instruction} does not have the address mode ${AddressModes[addressMode]} (line ${originalIndex})`)

            if (operandValue === null && instructionLength !== 1) throw new Error
            if (operandValue !== null) {
                if (operandValue >= 0x100 && instructionLength < 3)
                    throw new AssemblerError(`Instruction ${instruction} is only a byte, ${operandValue} is too big (line ${originalIndex})`)
                if (operandValue >= 0x10000)
                    throw new AssemblerError(`Instruction ${instruction} is only two bytes, ${operandValue} is too big (line ${originalIndex})`)
                machineCode[nextAvailableCodeByte + 1] = operandValue & 0xFF
                if (operandValue >= 0x100) {
                    machineCode[nextAvailableCodeByte + 2] = (operandValue & 0xFF00) >> 8
                }
            }
        }
        machineCode[nextAvailableCodeByte] = instructionSignatures.get(addressMode)!
        nextAvailableCodeByte += instructionLength
    }
    //Apply label mappings for jump and branch
    for (const [identifier, opcodePosition] of labelJumpReferences) { // TODO keep line numbers along to here for error
        const labelPos = labelDefinitions.get(identifier)
        if (labelPos === undefined) throw new Error

        machineCode[opcodePosition + 1] = labelPos & 0xFF
        machineCode[opcodePosition + 2] = (labelPos & 0xFF00) >> 8
    }
    for (const [identifier, opcodePosition] of labelBranchReferences) { // TODO keep line numbers along to here for error
        const labelPos = labelDefinitions.get(identifier)
        if (labelPos === undefined) throw new Error

        const relativePosition = labelPos - (opcodePosition + 2)
        if (relativePosition >= 128 || relativePosition < -128) {
            throw new AssemblerError(`Branch relative position is too high; identifier is ${identifier}`)
        }
        // 8-bit signed (twos compliment)
        machineCode[opcodePosition + 1] = relativePosition & 0xFF
    }

    machineCode[ResetVector_HI] = 0x80
    machineCode[ResetVector_LO] = 0x00

    return machineCode
}