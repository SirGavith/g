import path from "path"
import fs from 'fs'
import { AddressModeByteLengths, AddressModes, BranchInstructions, CodeVector, DataVector, InstructionOpcodes, JSRInstruction, JumpInstruction, OutputVector, ResetVector_HI, ResetVector_LO, StackVector, VariablesVector, VectorsVector, ZPageVector } 
    from "../../shared/Constants"

class CustomError extends Error {
    constructor(...message: any[]) { super(message.map(m => String(m)).join(' ')); this.name = this.constructor.name }
}
export class AssemblerError extends CustomError { constructor(...message: any[]) { super(message); this.name = this.constructor.name } }

type AssemblyLine = [string, number] // string, originalLineIndex

function ParseNumber(number: string, oi: number): number {
    if (number === '')
        throw new AssemblerError(`Expected number on line ${oi}`)
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
        throw new AssemblerError(`Could not parse number '${number}' on line ${oi}`)
    return int
}

function IsValidIdentifier(s: string): boolean {
    return /^\w[-_\w\d]*$/.test(s)
}

function RemoveSpaces(s: string): string {
    return s.replaceAll(' ', '')
}

export function Assemble(rawAssembly: string, filePath: string): Buffer {
    const machineCode = Buffer.alloc(0x8000)
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
    const tryAddIdentifier = (id: string, oi: number) => {
        if (id === undefined || id === '')
            throw new AssemblerError(`Identifier on line ${oi} is empty`)
        if (!IsValidIdentifier(id))
            throw new AssemblerError(`Identifier ${id} on line ${oi} is illegal`)
        if (allIdentifiers.has(id))
            throw new AssemblerError(`Identifier ${id} on line ${oi} is a duplicate`)
        allIdentifiers.add(id)
    }
    // Mapping between alloc identifiers and their memory positions
    const allocMapping = new Map<string, number>()
    const allocLengths = new Map<string, number>()
    const allocBytes = new Set<number>()
    const tryAddAllocMapping = (id: string, pos: number, length: number, oi: number, overrideSafety = false) => {
        tryAddIdentifier(id, oi)
        if (!overrideSafety &&
                (pos < 0 ||
                (pos >= StackVector && pos < VariablesVector) ||
                pos >= OutputVector))
            throw new AssemblerError(`Alloc out of range on line ${oi}`)

        for (let i = pos; i < pos + length; i++) {
            if (allocBytes.has(i)) throw new AssemblerError(`Alloc overlaps at $${i.toString(16)} on line ${oi}`)
            allocBytes.add(i)
        }
        allocMapping.set(id, pos)
        allocLengths.set(id, length)
    }
    
    //loads and allocs
    {
        let nextAvailableAllocByte = VariablesVector

        // loads
        {
            const loads = assembly.filter(l => l[0].startsWith('load '))
            if (loads.length > 0) throw new AssemblerError(`Loads are turned off rn ${loads[1][1]}`)

            if (loads.length > 1) throw new AssemblerError(`Only one load can be in a file; line ${loads[1][1]}`)
            if (loads.length === 1) {
                const load = loads[0][0].split(' ')
                const oi = loads[0][1]
                if (!load[1].startsWith("'") && !load[1].endsWith("'"))
                    throw new AssemblerError(`load must have a proper file path on line ${oi}`)
                
                const providedFilePath = load[1].slice(1, -1)
                const loadPath = providedFilePath.startsWith('c:') ?
                    providedFilePath :
                    path.join(filePath, providedFilePath)
                
                //load and copy file
                if (!fs.existsSync(loadPath))
                    throw new AssemblerError(`Load on line ${oi} points to a file that does not exist. Path: '${loadPath}'`)
                
                const loadFile = fs.readFileSync(loadPath)
                const fileLength = loadFile.byteLength

                if (fileLength > VectorsVector - DataVector)
                    throw new AssemblerError(`Load data on line ${oi} is too big ${fileLength}bytes > ${VectorsVector - DataVector}bytes`)

                loadFile.copy(machineCode, DataVector)
                machineCode[DataVector + fileLength] = 0

                //alloc load pointer and load length pointer
                tryAddAllocMapping(load[3], DataVector, 1, oi, true)
                tryAddAllocMapping(load[5], nextAvailableAllocByte, 2, oi)
                machineCode[nextAvailableAllocByte++] = fileLength & 0xFF
                machineCode[nextAvailableAllocByte++] = fileLength >> 8 & 0xFF
            }
        }

        // allocs
        assembly
            .filter(l => l[0].startsWith('alloc '))
            .forEach(([l, oi]) => {
                //a
                //a:0
                //a[2]
                //a[3]:$0C
                l = RemoveSpaces(l.slice(6))

                let allocLength = 1
                let identifier: string 
                let position: string | undefined

                if (l.includes('[') && l.includes(']')) {
                    identifier = l.slice(0, l.indexOf('['))
                    allocLength = ParseNumber(l.slice(l.indexOf('[') + 1, l.indexOf(']')), oi)
                    position = l.split(':')[1]
                }
                else {
                    [identifier, position] = l.split(':')
                }

                tryAddAllocMapping(identifier, 
                    (position === undefined ? nextAvailableAllocByte : ParseNumber(position, oi)),
                    allocLength, oi)
                if (position === undefined)
                    nextAvailableAllocByte += allocLength
            })
    }
    // Mapping between defineAddress identifiers and their definitions
    const defineAddressMapping = new Map<string, number>()
    {
        assembly
            .filter(l => l[0].startsWith('defineAddress '))
            .forEach(([l, oi]) => {
                const [identifier, value] = l.slice(14).split(':')
                    .map(s => s.trim())
                const v = ParseNumber(value, oi)
                if (v >= 0x10000)
                    throw new AssemblerError(`Define on line ${oi} has value over 0xFFFF`)
                tryAddIdentifier(identifier, oi)
                defineAddressMapping.set(identifier, v)
            })
    }
    // Mapping between define identifiers and their definitions
    const defineMapping = new Map<string, number>()
    {
        assembly
            .filter(l => l[0].startsWith('define '))
            .forEach(([l, oi]) => {
                const [identifier, value] = l.slice(7).split(':')
                    .map(s => s.trim())
                const v = ParseNumber(value, oi)
                if (v >= 0x100)
                    throw new AssemblerError(`Define on line ${oi} has value over 255; Immidiates must be only a byte`)
                tryAddIdentifier(identifier, oi)
                defineMapping.set(identifier, v)
            })
    }
    // List of label identifiers, we don't yet know their positions
    const labels = new Set<string>()
    {
        assembly.filter(l => l[0].startsWith('@'))
        .forEach(([l, originalIndex]) => {
            const identifier = l.slice(1).trim()
            tryAddIdentifier(identifier, originalIndex)
            labels.add(identifier)
        })
    }

    const labelJumpReferences: [string, number][] = [] // identifier, position of opcode
    const labelBranchReferences: [string, number][] = [] // identifier, position of opcode

    let nextAvailableCodeByte = CodeVector
    const labelDefinitions = new Map<string, number>()
    //Loop through each line of assembly
    for (const [line, oi] of assembly) {
        if (line.startsWith('alloc ') ||
            line.startsWith('load ') ||
            line.startsWith('defineAddress ') ||
        line.startsWith('define ')) continue
        if (line.startsWith('@')) { // label
            const identifier = line.slice(1).split(' ')[0].trim()
            labelDefinitions.set(identifier, nextAvailableCodeByte)
            continue
        }
        const [instruction, operand] = line.split(/ (.*)/, 2).map(s => RemoveSpaces(s))
        if (!InstructionOpcodes.has(instruction)) 
            throw new AssemblerError(`Cannot understand line ${oi} '${line}'`)
        // Lines is an instruction

        // instructionSignatures is a map of all the possible addressModes to their opcodes
        const instructionSignatures = InstructionOpcodes.get(instruction)!

        // Determine addressMode and instructionLength
        // let instructionLength: number | undefined = undefined
        let addressMode: AddressModes | undefined = undefined

        if (instruction === JumpInstruction) {
            // instructionLength = 3
            let label = operand
            if (operand.startsWith('(') && operand.endsWith(')')) {
                label = operand.slice(1, -1)
                addressMode = AddressModes.Indirect
            }
            else addressMode = AddressModes.Absolute

            if (!labels.has(label)) 
                throw new AssemblerError(`Instruction 'JMP' on line ${oi} does not reference a label`)

            labelJumpReferences.push([label, nextAvailableCodeByte])
        }
        else if (instruction === JSRInstruction) {
            if (!labels.has(operand))
                throw new AssemblerError(`Instruction 'JSR' on line ${oi} does not reference a label`)

            labelJumpReferences.push([operand, nextAvailableCodeByte])
            addressMode = AddressModes.Absolute
        } 
        else if (BranchInstructions.includes(instruction)) { // branch
            if (!labels.has(operand))
                throw new AssemblerError(`Instruction ${instruction} on line ${oi} does not reference a label`)

            labelBranchReferences.push([operand, nextAvailableCodeByte])
            addressMode = AddressModes.ZeropageR
        }
        else { //not a label, write operand
            let operandValue: number | null | undefined = undefined
                //null is no operand; undefined is not yet defined

            if (operand === undefined) {
                if (!instructionSignatures.has(AddressModes.Implied)) {
                    throw new AssemblerError(`Instruction ${instruction} has no implied address mode`)
                }
                addressMode = AddressModes.Implied
                operandValue = null
            }
            else if (operand.startsWith('(')) {
                let opr: string
                if (operand.endsWith(',X)')) {
                    addressMode = AddressModes.IndirectX
                    opr = operand.slice(1, -3)
                }
                else if (operand.endsWith('),Y')) {
                    addressMode = AddressModes.IndirectY
                    opr = operand.slice(1, -3)
                }
                else if (operand.endsWith(')')) {
                    addressMode = AddressModes.Indirect
                    opr = operand.slice(1, -1)
                }
                else throw new AssemblerError(`Could not understand operand ${operand} on line ${oi}`)
                operandValue = allocMapping.has(opr) ?
                    allocMapping.get(opr)! :
                    ParseNumber(opr, oi)
            }
            else if (operand.startsWith('#')) {
                let opr = operand.slice(1)
                let n: number
                if (operand.at(-3) === ':') {
                    const byte = opr.slice(-2)
                    if (byte !== 'LO' && byte !== 'HI')
                        throw new AssemblerError(`Alloc immediate address query must either be 'LO' or 'HI' on line ${oi}`)
                    opr = opr.slice(0, -3)

                    if (!allocMapping.has(opr))
                        throw new AssemblerError(`Alloc immediate address identifier does not exist on line ${oi}`)

                    n = (byte === 'LO') ?
                        allocMapping.get(opr)! & 0xFF :
                        allocMapping.get(opr)! >> 8 & 0xFF
                }
                else {
                    n = ParseNumber(opr, oi)
                }

                addressMode = AddressModes.Immediate
                operandValue = n
            }
            else if (operand.endsWith(',X')) {
                const opr = operand.slice(0, -2)

                operandValue = allocMapping.has(opr) ? 
                    allocMapping.get(opr)! :
                    ParseNumber(opr, oi)
                addressMode = operandValue < 0x100 ?
					AddressModes.ZeropageX : AddressModes.AbsoluteX
            }
            else if (operand.endsWith(',Y')) {
                const opr = operand.slice(0, -2)

                operandValue = allocMapping.has(opr) ?
                    allocMapping.get(opr)! :
                    ParseNumber(opr, oi)

                addressMode = (operandValue < 0x100 && instructionSignatures.has(AddressModes.ZeropageY)) ?
					AddressModes.ZeropageY : AddressModes.AbsoluteY
            }
            else if (operand.includes(',')) {
                const [opr, index] = operand.split(',')
                if (!allocMapping.has(opr))
                    throw new AssemblerError(`Indexed address does not reference a valid identifier; line ${oi}`)
                const parsedIndex = ParseNumber(index, oi)
                if (parsedIndex >= allocLengths.get(opr)!)
                    throw new AssemblerError(`Indexed address index '${index}' is larger than the allocated size of ${allocLengths.get(opr)!} bytes; line ${oi}`)
                operandValue = allocMapping.get(opr)! + parsedIndex
                addressMode = operandValue < 0x100 ?
                    AddressModes.ZeropageR : AddressModes.Absolute
            }
            else if (allocMapping.has(operand)) {
                operandValue = allocMapping.get(operand)!
                addressMode = operandValue < 0x100 ?
					AddressModes.ZeropageR : AddressModes.Absolute
            }
            else if (defineAddressMapping.has(operand)) {
                operandValue = defineAddressMapping.get(operand)!
                addressMode = AddressModes.Absolute
                if (!instructionSignatures.has(addressMode))
                    throw new AssemblerError(`DefineAddresses only work as absolute addresses; line ${oi}`)
            }
            else if (defineMapping.has(operand)) {
                const m = defineMapping.get(operand)!
                if (!instructionSignatures.has(AddressModes.Immediate))
                    throw new AssemblerError(`Definitions only work as immidiate values; line ${oi}`)
                addressMode = AddressModes.Immediate
                operandValue = m
            }
            else {
                const n = ParseNumber(operand, oi)
                addressMode = n < 0x100 ?
					AddressModes.ZeropageR : AddressModes.Absolute
                operandValue = n
            }

            if (addressMode === undefined || operandValue === undefined) throw new Error
            const instructionLength = AddressModeByteLengths.get(addressMode)!
            if (!instructionSignatures.has(addressMode))
                throw new AssemblerError(`Instruction ${instruction} does not have the address mode ${AddressModes[addressMode]} (line ${oi})`)

            if (operandValue === null && instructionLength !== 1) throw new Error
            if (operandValue !== null) {
                if (operandValue >= 0x100 && instructionLength < 3)
                    throw new AssemblerError(`Instruction ${instruction} is only a byte, ${operandValue} is too big (line ${oi})`)
                if (operandValue >= 0x10000)
                    throw new AssemblerError(`Instruction ${instruction} is only two bytes, ${operandValue} is too big (line ${oi})`)
                machineCode[(nextAvailableCodeByte + 1) - CodeVector] = operandValue & 0xFF
                if (operandValue >= 0x100) {
                    machineCode[(nextAvailableCodeByte + 2) - CodeVector] = (operandValue & 0xFF00) >> 8
                }
            }
        }
        machineCode[nextAvailableCodeByte - CodeVector] = instructionSignatures.get(addressMode)!
        nextAvailableCodeByte += AddressModeByteLengths.get(addressMode)!
    }
    //Apply label mappings for jump and branch
    for (const [identifier, opcodePosition] of labelJumpReferences) { // TODO keep line numbers along to here for error
        const labelPos = labelDefinitions.get(identifier)
        if (labelPos === undefined) throw new Error

        machineCode[opcodePosition + 1 - CodeVector] = labelPos & 0xFF
        machineCode[opcodePosition + 2 - CodeVector] = (labelPos & 0xFF00) >> 8
    }
    for (const [identifier, opcodePosition] of labelBranchReferences) { // TODO keep line numbers along to here for error
        const labelPos = labelDefinitions.get(identifier)
        if (labelPos === undefined) throw new Error

        const relativePosition = labelPos - (opcodePosition + 2)
        if (relativePosition >= 128 || relativePosition < -128) {
            throw new AssemblerError(`Branch relative position is too high; identifier is ${identifier}`)
        }
        // 8-bit signed (twos compliment)
        machineCode[opcodePosition + 1 - CodeVector] = relativePosition & 0xFF
    }

    machineCode[ResetVector_HI - CodeVector] = 0x80
    machineCode[ResetVector_LO - CodeVector] = 0x00

    return machineCode
}