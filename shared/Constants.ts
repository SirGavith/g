export enum AddressModes {
    Absolute,
    AbsoluteX,
    AbsoluteY,
    Immediate,
    Implied,
    Indirect,
    IndirectX,
    IndirectY,
    ZeropageR,
    ZeropageX,
    ZeropageY,
}

export const AddressModeByteLengths = new Map<AddressModes, number>([
    [AddressModes.Absolute,          3 ],
    [AddressModes.AbsoluteX,         3 ],
    [AddressModes.AbsoluteY,         3 ],
    [AddressModes.Immediate,         2 ],
    [AddressModes.Implied,           1 ],
    [AddressModes.Indirect,          3 ],
    [AddressModes.IndirectX,         2 ],
    [AddressModes.IndirectY,         2 ],
    [AddressModes.ZeropageR,         2 ],
    [AddressModes.ZeropageX,         2 ],
    [AddressModes.ZeropageY,         2 ],
])

export type InstructionSignature = {
    [mode in AddressModes]?: number;
}

export const InstructionOpcodes = new Map<string, Map<AddressModes, number>>([
['ADC', new Map([
        [AddressModes.Immediate, 0x69],
        [AddressModes.ZeropageR, 0x65],
        [AddressModes.ZeropageX, 0x75],
        [AddressModes.Absolute, 0x6D],
        [AddressModes.AbsoluteX, 0x7D],
        [AddressModes.AbsoluteY, 0x79],
        [AddressModes.IndirectX, 0x61],
        [AddressModes.IndirectY, 0x71],
    ])],
['AND', new Map([
        [AddressModes.Immediate, 0x29],
        [AddressModes.ZeropageR, 0x25],
        [AddressModes.ZeropageX, 0x35],
        [AddressModes.Absolute, 0x2D],
        [AddressModes.AbsoluteX, 0x3D],
        [AddressModes.AbsoluteY, 0x39],
        [AddressModes.IndirectX, 0x21],
        [AddressModes.IndirectY, 0x31],
    ])],
['ASL', new Map([
        [AddressModes.Implied, 0x0A],
        [AddressModes.ZeropageR, 0x06],
        [AddressModes.ZeropageX, 0x16],
        [AddressModes.Absolute, 0x0E],
        [AddressModes.AbsoluteX, 0x1E],
    ])],
['BCC', new Map([
        [AddressModes.ZeropageR, 0x90],
    ])],
['BCS', new Map([
        [AddressModes.ZeropageR, 0xB0],
    ])],
['BEQ', new Map([
        [AddressModes.ZeropageR, 0xF0],
    ])],
['BIT', new Map([
        [AddressModes.ZeropageR, 0x24],
        [AddressModes.Absolute, 0x2C],
    ])],
['BMI', new Map([
        [AddressModes.ZeropageR, 0x30],
    ])],
['BNE', new Map([
        [AddressModes.ZeropageR, 0xD0],
    ])],
['BPL', new Map([
        [AddressModes.ZeropageR, 0x10],
    ])],
['BRK', new Map([
        [AddressModes.Implied, 0x00],
    ])],
['BVC', new Map([
        [AddressModes.ZeropageR, 0x50],
    ])],
['BVS', new Map([
        [AddressModes.ZeropageR, 0x70],
    ])],
['CLC', new Map([
        [AddressModes.Implied, 0x18],
    ])],
['CLD', new Map([
        [AddressModes.Implied, 0xD8],
    ])],
['CLI', new Map([
        [AddressModes.Implied, 0xB8],
    ])],
['CMP', new Map([
        [AddressModes.Immediate, 0xC9],
        [AddressModes.ZeropageR, 0xC5],
        [AddressModes.ZeropageX, 0xD5],
        [AddressModes.Absolute, 0xCD],
        [AddressModes.AbsoluteX, 0xDD],
        [AddressModes.AbsoluteY, 0xD9],
        [AddressModes.IndirectX, 0xC1],
        [AddressModes.IndirectY, 0xD1],
    ])],
['CPX', new Map([
        [AddressModes.Immediate, 0xE0],
        [AddressModes.ZeropageR, 0xE4],
        [AddressModes.Absolute, 0xEC],
    ])],
['CPY', new Map([
        [AddressModes.Immediate, 0xC0],
        [AddressModes.ZeropageR, 0xC4],
        [AddressModes.Absolute, 0xCC],
    ])],
['DEC', new Map([
        [AddressModes.ZeropageR, 0xC6],
        [AddressModes.ZeropageX, 0xD6],
        [AddressModes.Absolute, 0xCE],
        [AddressModes.AbsoluteX, 0xDE],
    ])],
['DEX', new Map([
        [AddressModes.Implied, 0xCA],
    ])],
['DEY', new Map([
        [AddressModes.Implied, 0x88],
    ])],
['EOR', new Map([
        [AddressModes.Immediate, 0x49],
        [AddressModes.ZeropageR, 0x45],
        [AddressModes.ZeropageX, 0x55],
        [AddressModes.Absolute, 0x4D],
        [AddressModes.AbsoluteX, 0x5D],
        [AddressModes.AbsoluteY, 0x59],
        [AddressModes.IndirectX, 0x41],
        [AddressModes.IndirectY, 0x51],
    ])],
['INC', new Map([
        [AddressModes.ZeropageR, 0xE6],
        [AddressModes.ZeropageX, 0xF6],
        [AddressModes.Absolute, 0xEE],
        [AddressModes.AbsoluteX, 0xFE],
    ])],
['INX', new Map([
        [AddressModes.Implied, 0xE8],
    ])],
['INY', new Map([
        [AddressModes.Implied, 0xC8],
    ])],
['JMP', new Map([
        [AddressModes.Absolute, 0x4C],
        [AddressModes.Indirect, 0x6C],
    ])],
['JSR', new Map([
        [AddressModes.Absolute, 0x20],
    ])],
['LDA', new Map([
        [AddressModes.Immediate, 0xA9],
        [AddressModes.ZeropageR, 0xA5],
        [AddressModes.ZeropageX, 0xB5],
        [AddressModes.Absolute, 0xAD],
        [AddressModes.AbsoluteX, 0xBD],
        [AddressModes.AbsoluteY, 0xB9],
        [AddressModes.IndirectX, 0xA1],
        [AddressModes.IndirectY, 0xB1],
    ])],
['LDX', new Map([
        [AddressModes.Immediate, 0xA2],
        [AddressModes.ZeropageR, 0xA6],
        [AddressModes.ZeropageY, 0xB6],
        [AddressModes.Absolute, 0xAE],
        [AddressModes.AbsoluteY, 0xBE],
    ])],
['LDY', new Map([
        [AddressModes.Immediate, 0xA0],
        [AddressModes.ZeropageR, 0xA4],
        [AddressModes.ZeropageX, 0xB4],
        [AddressModes.Absolute, 0xAC],
        [AddressModes.AbsoluteX, 0xBC],
    ])],
['LOG', new Map([
        [AddressModes.Implied, 0xFA],
    ])],
['LSR', new Map([
        [AddressModes.Implied, 0x4A],
        [AddressModes.ZeropageR, 0x46],
        [AddressModes.ZeropageX, 0x56],
        [AddressModes.Absolute, 0x4E],
        [AddressModes.AbsoluteX, 0x5E],
    ])],
['NOP', new Map([
        [AddressModes.Implied, 0xEA],
    ])],
['ORA', new Map([
        [AddressModes.Immediate, 0x09],
        [AddressModes.ZeropageR, 0x05],
        [AddressModes.ZeropageX, 0x15],
        [AddressModes.Absolute, 0x0D],
        [AddressModes.AbsoluteX, 0x1D],
        [AddressModes.AbsoluteY, 0x19],
        [AddressModes.IndirectX, 0x01],
        [AddressModes.IndirectY, 0x11],
    ])],
['PHA', new Map([
        [AddressModes.Implied, 0x48],
    ])],
['PHP', new Map([
        [AddressModes.Implied, 0x08],
    ])],
['PLA', new Map([
        [AddressModes.Implied, 0x68],
    ])],
['PLP', new Map([
        [AddressModes.Implied, 0x28],
    ])],
['ROL', new Map([
        [AddressModes.Implied, 0x2A],
        [AddressModes.ZeropageR, 0x26],
        [AddressModes.ZeropageX, 0x36],
        [AddressModes.Absolute, 0x2E],
        [AddressModes.AbsoluteX, 0x3E],
    ])],
['ROR', new Map([
        [AddressModes.Implied, 0x6A],
        [AddressModes.ZeropageR, 0x66],
        [AddressModes.ZeropageX, 0x76],
        [AddressModes.Absolute, 0x6E],
        [AddressModes.AbsoluteX, 0x7E],
    ])],
['RTI', new Map([
        [AddressModes.Implied, 0x40],
    ])],
['RTS', new Map([
        [AddressModes.Implied, 0x60],
    ])],
['SBC', new Map([
        [AddressModes.Immediate, 0xE9],
        [AddressModes.ZeropageR, 0xE5],
        [AddressModes.ZeropageX, 0xF5],
        [AddressModes.Absolute, 0xED],
        [AddressModes.AbsoluteX, 0xFD],
        [AddressModes.AbsoluteY, 0xF9],
        [AddressModes.IndirectX, 0xE1],
        [AddressModes.IndirectY, 0xF1],
    ])],
['SEC', new Map([
        [AddressModes.Implied, 0x38],
    ])],
['SED', new Map([
        [AddressModes.Implied, 0xF8],
    ])],
['SEI', new Map([
        [AddressModes.Implied, 0x78],
    ])],
['STA', new Map([
        [AddressModes.ZeropageR, 0x85],
        [AddressModes.ZeropageX, 0x95],
        [AddressModes.Absolute, 0x8D],
        [AddressModes.AbsoluteX, 0x9D],
        [AddressModes.AbsoluteY, 0x99],
        [AddressModes.IndirectX, 0x81],
        [AddressModes.IndirectY, 0x91],
    ])],
['STX', new Map([
        [AddressModes.ZeropageR, 0x86],
        [AddressModes.ZeropageY, 0x96],
        [AddressModes.Absolute, 0x8E],
    ])],
['STY', new Map([
        [AddressModes.ZeropageR, 0x84],
        [AddressModes.ZeropageX, 0x94],
        [AddressModes.Absolute, 0x8C],
    ])],
['TAX', new Map([
        [AddressModes.Implied, 0xAA],
    ])],
['TAY', new Map([
        [AddressModes.Implied, 0xA8],
    ])],
['TSX', new Map([
        [AddressModes.Implied, 0xBA],
    ])],
['TXA', new Map([
        [AddressModes.Implied, 0x8A],
    ])],
['TXS', new Map([
        [AddressModes.Implied, 0x9A],
    ])],
['TYA', new Map([
        [AddressModes.Implied, 0x98],
    ])],
])

export const JumpInstruction = 'JMP'
export const JSRInstruction = 'JSR'
export const BranchInstructions = ['BCC', 'BCS', 'BEQ', 'BMI', 'BNE', 'BPL', 'BVC', 'BVS']

export const NonmaskableInterruptVector_LO = 0xFFFA
export const NonmaskableInterruptVector_HI = 0xFFFB

export const ResetVector_LO = 0xFFFC
export const ResetVector_HI = 0xFFFD

export const InterruptRequestVector_LO = 0xFFFE
export const InterruptRequestVector_HI = 0xFFFF

// export const ValidInstructions = new Set<string>(InstructionOpcodes.keys())

// export const ValidOpcodes: number[] = InstructionOpcodes.values().flatMap(s => Object.values(s))