import { AddressModeByteLengths, AddressModes, InstructionOpcodes, InstructionSignature, ResetVector_HI, ResetVector_LO } from '../../shared/Constants'

class CustomError extends Error {
    constructor(...message: any[]) { super(message.map(m => String(m)).join(' ')); this.name = this.constructor.name }
}

export class RuntimeError extends CustomError { constructor(...message: any[]) { super(message); this.name = this.constructor.name } }

export class Emu6502 {
    public Storage = new Uint8Array(0xFFFF)
    public Debug = true
    public Running = true

    //#region Registers
    readonly registers16 = new Uint16Array(1)
    readonly registers8 = new Uint8Array(5)
    get PC()          { return this.registers16[0] } // Program Counter
    set PC(n: number) { this.registers16[0] = n }    // Program Counter
    get A()           { return this.registers8[0] }  // Accumulator
    set A(n: number)  { this.registers8[0] = n }     // Accumulator
    get X()           { return this.registers8[1] }  // X Register
    set X(n: number)  { this.registers8[1] = n }     // X Register
    get Y()           { return this.registers8[2] }  // Y Register
    set Y(n: number)  { this.registers8[2] = n }     // Y Register
    get SP()          { return this.registers8[3] }  // Stack Pointer
    set SP(n: number) { this.registers8[3] = n }     // Stack Pointer
    get SR()          { return this.registers8[4] }  // Status Register [NV-BDIZC]
    set SR(n: number) { this.registers8[4] = n }     // Status Register [NV-BDIZC]

    get Negative()  { return this.SR >> 7 & 1 }
    get Overflow()  { return this.SR >> 6 & 1 }
    get Break()     { return this.SR >> 4 & 1 }
    get Decimal()   { return this.SR >> 3 & 1 }
    get Interrupt() { return this.SR >> 2 & 1 }
    get Zero()      { return this.SR >> 1 & 1 }
    get Carry()     { return this.SR & 1 }

    set Negative(n: number)  { this.SR = this.SR & 0x7F | n << 7 }
    set Overflow(n: number)  { this.SR = this.SR & 0xBF | n << 6 }
    set Break(n: number)     { this.SR = this.SR & 0xEF | n << 4 }
    set Decimal(n: number)   { this.SR = this.SR & 0xF7 | n << 3 }
    set Interrupt(n: number) { this.SR = this.SR & 0xFB | n << 2 }
    set Zero(n: number)      { this.SR = this.SR & 0xFD | n << 1 }
    set Carry(n: number)     { this.SR = this.SR & 0xFE | n }

    setNZ = (n: number) => { this.Negative = n >> 8 & 1; this.Zero = n === 0 ? 1 : 0 }
    setNZC = (n: number, c: number) => { this.setNZ(n); this.Carry = c }
    setNZA = (n: number) => { this.setNZ(n); this.A = n }
    //#endregion

    //#region Execute Cycle
    Execute() {
        if (!this.Storage) throw new RuntimeError('Storage is empty')
        if (this.Storage.length !== 0x10000) throw new RuntimeError('Storage is of wrong size')

        this.PC = (this.Storage[ResetVector_HI] << 8) | this.Storage[ResetVector_LO]
        this.SP = 0xFF
        this.setNZ(0)
        this.Interrupt = 1

        if (this.Debug) {
            console.log(
                ' PC  | ' +
                ' Opcode  | ' +
                ' Disassembled  |' +
                ' A  X  Y  SP |' +
                ' NV-BDIZC |' +
                ' $4 |' +
                ' $200 - $210 '
            )
        }

        while (this.Running && this.PC < this.Storage.length) {
            this.ExecuteInstruction()
            this.PC++
        }
    }

    ExecuteInstruction() {
        const opcode = this.getOpcode()

        let counterString: string = this.PC.toString(16)
        let instString: string | undefined = undefined
        let instructionBytes: number[] = []
        let disass: string | undefined = undefined

        if (this.Debug) {
            let addressMode: AddressModes | undefined = undefined
            InstructionOpcodes.forEach((opcs, instr) => {
                for (const [mode, opc] of opcs.entries()) {
                    if (opc === opcode) {
                        instString = instr
                        addressMode = mode
                        break
                    }
                }
            })
            if (addressMode === undefined || instString === undefined)
                throw new RuntimeError(`Cannot resolve opcode ${opcode}`)
            const bytes = AddressModeByteLengths.get(addressMode)!

            const num =
                bytes === 3 ? (this.getOpcode(2) << 8 | this.getOpcode(1)).toString(16) :
                    bytes === 2 ? this.getOpcode(1).toString(16) : ''

            // this.LogStatus()

            for (let i = this.PC; i < this.PC + bytes; i++) {
                instructionBytes.push(this.Storage[i])
            }

            disass = addressMode === AddressModes.Absolute ? `$${num}` :
                addressMode === AddressModes.AbsoluteX ? `$${num},X` :
                addressMode === AddressModes.AbsoluteY ? `$${num},Y` :
                addressMode === AddressModes.Immediate ? `#$${num}` :
                addressMode === AddressModes.Implied ? `` :
                addressMode === AddressModes.Indirect ? `($${num})` :
                addressMode === AddressModes.IndirectX ? `($${num},X)` :
                addressMode === AddressModes.IndirectY ? `($${num}),Y` :
                addressMode === AddressModes.ZeropageR ? `$${num}` :
                addressMode === AddressModes.ZeropageX ? `$${num},X` :
                addressMode === AddressModes.ZeropageY ? `$${num},Y` :
                undefined
        }

        this.Instructions[opcode]()

        if (this.Debug) {
            const watchArr = []
            for (const val of this.Storage.slice(0x200, 0x210)) {
                watchArr.push(this.ToString(val, 2, 16))
            }
            console.log(
                counterString.padStart(4, '0') + ' | ' +
                instructionBytes
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join(' ').padEnd(8, ' ') + ' | '+
                (instString + ' ' + disass).padEnd(14, ' ') + ' | ' +
                this.ToString(this.A , 2, 16) + ' ' +
                this.ToString(this.X , 2, 16) + ' ' +
                this.ToString(this.Y , 2, 16) + ' ' +
                this.ToString(this.SP, 2, 16) + ' | ' +
                this.ToString(this.SR, 8,  2) + ' | ' +
                //watches
                this.ToString(this.Storage[4], 2, 16) + ' | ' +
                watchArr.join(',')
            )
        }
    }
    //#endregion

    //#region Execute Helper Methods
    getOpcode(offset = 0) { return this.Storage[this.PC + offset] }
    nextByte() { this.PC++; return this.getOpcode() }
    nextWord() { this.PC += 2; return this.getOpcode() << 8 | this.getOpcode(-1) }
    getRAMWord(memAddress: number) { return (this.Storage[(memAddress + 1) & 0xFF] << 8) | this.Storage[memAddress] }
    StackPush(n: number) {
        this.Storage[this.SP & 0x100] = n
        this.SP--
    }
    StackPull() {
        this.SP++
        const pull = this.Storage[this.SP & 0x100]
        this.Storage[this.SP & 0x100] = 0
        return pull
    }
    //#endregion

    //#region Helper Methods
    private ToMultiString(n: number) {
        return `0b${n.toString(2)}  ${n.toString(10)}  \$${n.toString(16)}`
    }
    private ToString(n: number, length: number, base: number): string {
        return n.toString(base).padStart(length, '0')
    }
    //#endregion

    //#region Address Mode Helpers
    AdrAbsolute() { return this.nextWord() }
    AdrAbsoluteX() { return (this.nextWord() + this.X) & 0xFFFF }
    AdrAbsoluteY() { return (this.nextWord() + this.Y) & 0xFFFF }
    AdrIndirect() { return this.Storage[this.nextWord()] }
    AdrXIndirect() { return this.getRAMWord(this.nextByte() + this.X) }
    AdrIndirectY() { return this.Storage[this.nextByte()] + this.Y }
    AdrRelative() { 
        const offset = this.nextByte()
        return ((offset & 0x80) === 0) ? offset : -(~offset + 1 & 0xFF)
    }
    AdrZeropage() { return this.nextByte() }
    AdrZeropageX() { return (this.nextByte() + this.X) & 0xFF }
    AdrZeropageY() { return (this.nextByte() + this.X) & 0xFF }
    //#endregion

    //#region Instruction Methods
    /** @param arg Addition operand */
    ADC(arg: number) {
        const sum = this.A + arg + this.Carry
        this.Carry = sum > 0xFF ? 1 : 0
        this.Overflow = ~(this.A ^ arg) & (this.A ^ sum) & 0x80
        this.setNZA(sum)
    }
    /** @param arg And operand */
    AND(arg: number) { this.setNZA(this.A & arg) }
    /** @param memAddress Memory address to ASL; defaults to A register */
    ASL(memAddress?: number) {
        const val = memAddress ? this.Storage[memAddress] : this.A
        this.Carry = val >> 7 & 1
        if (memAddress) {
            this.Storage[memAddress] = val << 1 & 0xFF
            this.setNZ(this.Storage[memAddress])
        } else {
            //accumulator
            this.setNZA(this.A << 1 & 0xFF)
        }
    }
    /** @param arg Branch destination memory address */
    BCC(arg: number) { if (this.Carry === 0) this.PC += arg }
    /** @param arg Branch destination memory address */
    BCS(arg: number) { if (this.Carry === 1) this.PC += arg }
    /** @param arg Branch destination memory address */
    BEQ(arg: number) { if (this.Zero === 1) this.PC += arg }
    /** @param arg Bit test operand */
    BIT(arg: number) {
        this.SR = this.SR & 0x3D | (arg & 0xC0) | ((this.A & arg) === 0 ? 2 : 0)
    }
    /** @param arg Branch destination memory address */
    BMI(arg: number) { if (this.Negative === 1) this.PC += arg }
    /** @param arg Branch destination memory address */
    BNE(arg: number) { if (this.Zero === 0) this.PC += arg }
    /** @param arg Branch destination memory address */
    BPL(arg: number) { if (this.Negative === 0) this.PC += arg }

    BRK() { //TODO: www.masswerk.at/6502/6502_instruction_set.html#BRK
        //for now, just halt
        this.Running = false
    } 
    /** @param arg Branch destination memory address */
    BVC(arg: number) { if (this.Overflow === 0) this.PC += arg }
    /** @param arg Branch destination memory address */
    BVS(arg: number) { if (this.Overflow === 1) this.PC += arg }
    CLC() { this.Carry = 0 }
    CLD() { this.Decimal = 0 }
    CLI() { this.Interrupt = 0 }
    CLV() { this.Overflow = 0 }
    /** @param arg Compare operand */
    CMP(arg: number) { this.setNZC(this.A - arg, this.A >= arg ? 1 : 0) }
    /** @param arg Compare operand */
    CPX(arg: number) { this.setNZC(this.X - arg, this.A >= arg ? 1 : 0) }
    /** @param arg Compare operand */
    CPY(arg: number) { this.setNZC(this.Y - arg, this.A >= arg ? 1 : 0) }
    /** @param memAddress DEC memAddress */
    DEC(memAddress: number) { this.setNZ(this.Storage[memAddress] - 1) }
    DEX() { this.setNZ(--this.X) }
    DEY() { this.setNZ(--this.X) }
    /** @param arg Compare operand */
    EOR(arg: number) { this.setNZA(this.A ^ arg) }
    /** @param memAddress INC Destination memAddress */
    INC(memAddress: number) { this.setNZ(++this.Storage[memAddress]) }
    INX() { this.setNZ(++this.X) }
    INY() { this.setNZ(++this.Y) }
    /** @param arg Jump destination memory address */
    JMP(arg: number) { this.PC = arg }
    /** @param arg JSR subroutine memory address */
    JSR(arg: number) {
        this.StackPush(this.PC + 2)
        this.PC = arg
    }
    /** @param arg LDA value */
    LDA(arg: number) { this.setNZA(arg) }
    /** @param arg LDX value */
    LDX(arg: number) { this.X = arg }
    /** @param arg LDY value */
    LDY(arg: number) { this.Y = arg }
    LOG() { console.log(`0b${this.A.toString(2)}   ${this.A.toString(10)}   0x${this.A.toString(16)}`) }
    /** @param memAddress Memory address to LSR; defaults to A register */
    LSR(memAddress?: number) {
        const val = memAddress ? this.Storage[memAddress] : this.A
        this.Carry = val & 1
        if (memAddress) {
            this.setNZ(this.Storage[memAddress])
            this.Storage[memAddress] = (val >> 1) & 0xFF
        } else {
            //accumulator
            this.setNZA((val >> 1) & 0xFF)
        }
    }
    NOP() { }
    /** @param arg ORA value */
    ORA(arg: number) { this.setNZA(this.A | arg) }
    PHA() { this.StackPush(this.A) }
    PHP() { this.StackPush(this.SR | 0x30) }
    PLA() { this.setNZA(this.StackPull()) }
    PLP() { this.SR = this.StackPull() & 0xCF }
    /** @param memAddress Memory address to ROL; defaults to A register */
    ROL(memAddress?: number) {
        const val = memAddress ? this.Storage[memAddress] : this.A
        const c = this.Carry
        this.Carry = val >> 7 & 1
        if (memAddress) {
            this.Storage[memAddress] = val << 1 | c & 0xFF
            this.setNZ(this.Storage[memAddress])
        } else {
            this.setNZA(val << 1 | c & 0xFF)
        }
    }
    /** @param memAddress Memory address to ROR; defaults to A register */
    ROR(memAddress?: number) {
        const val = memAddress ? this.Storage[memAddress] : this.A
        const c = this.Carry
        this.Carry = val & 1
        if (memAddress) {
            this.Storage[memAddress] = val >> 1 | (c << 7)
            this.setNZ(this.Storage[memAddress])
        } else {
            this.setNZA(val >> 1 | (c << 7))
        }
    }
    RTI() {
        this.PLP()
        this.PC = this.StackPull()
    }
    RTS() { this.PC = this.StackPull() + 1 }
    /** @param arg SBC operand */
    SBC(arg: number) { this.ADC(~arg) }
    SEC() { this.Carry = 1 }
    SED() { this.Decimal = 1 }
    SEI() { this.Interrupt = 1 }
    /** @param memAddress STA Destination memAddress */
    STA(memLocation: number) { this.Storage[memLocation] = this.A }
    /** @param memAddress STX Destination memAddress */
    STX(memLocation: number) { this.Storage[memLocation] = this.X }
    /** @param memAddress STA Destination memAddress */
    STY(memLocation: number) { this.Storage[memLocation] = this.Y }
    TAX() { this.X = this.A }
    TAY() { this.Y = this.A }
    TSX() { this.X = this.SP }
    TXA() { this.setNZA(this.X) }
    TXS() { this.SP = this.X }
    TYA() { this.setNZA(this.Y) }
    //#endregion

    //#region Instructions by Opcode
    Instructions: { [opcode: number]: () => void } = {
        0x00: () => { this.BRK() }, /** BRK impl  */
        0x01: () => { this.ORA(this.Storage[this.AdrXIndirect()]) }, /** ORA X,ind	*/
        0x05: () => { this.ORA(this.Storage[this.AdrZeropage()]) }, /** ORA zpg	*/
        0x06: () => { this.ASL(this.AdrZeropage()) }, /** ASL zpg	*/
        0x08: () => { this.PHP() }, /** PHP impl	*/
        0x09: () => { this.ORA(this.nextByte()) }, /** ORA #	    */
        0x0A: () => { this.ASL() }, /** ASL A	    */
        0x0D: () => { this.ORA(this.Storage[this.AdrAbsolute()]) }, /** ORA abs	*/
        0x0E: () => { this.ASL(this.AdrAbsolute()) }, /** ASL abs	*/
        0x10: () => { this.BPL(this.AdrRelative()) }, /** BPL rel	*/
        0x11: () => { this.ORA(this.Storage[this.AdrIndirectY()]) }, /** ORA ind,Y	*/
        0x15: () => { this.ORA(this.Storage[this.AdrZeropageX()]) }, /** ORA zpg,X	*/
        0x16: () => { this.ASL(this.AdrZeropageX()) }, /** ASL zpg,X	*/
        0x18: () => { this.CLC() }, /** CLC impl	*/
        0x19: () => { this.ORA(this.Storage[this.AdrAbsoluteY()]) }, /** ORA abs,Y	*/
        0x1D: () => { this.ORA(this.Storage[this.AdrAbsoluteX()]) }, /** ORA abs,X	*/
        0x1E: () => { this.ASL(this.AdrAbsoluteX()) }, /** ASL abs,X	*/
        0x20: () => { this.JSR(this.AdrAbsolute()) }, /** JSR abs	*/
        0x21: () => { this.AND(this.Storage[this.AdrXIndirect()]) }, /** AND X,ind	*/
        0x24: () => { this.BIT(this.Storage[this.AdrZeropage()]) }, /** BIT zpg	*/
        0x25: () => { this.AND(this.Storage[this.AdrZeropage()]) }, /** AND zpg	*/
        0x26: () => { this.ROL(this.AdrZeropage()) }, /** ROL zpg	*/
        0x28: () => { this.PLP() }, /** PLP impl	*/
        0x29: () => { this.AND(this.nextByte()) }, /** AND #      */
        0x2A: () => { this.ROL() }, /** ROL A      */
        0x2C: () => { this.BIT(this.Storage[this.AdrAbsolute()]) }, /** BIT abs	*/
        0x2D: () => { this.AND(this.Storage[this.AdrAbsolute()]) }, /** AND abs	*/
        0x2E: () => { this.ROL(this.AdrAbsolute()) }, /** ROL abs    */
        0x30: () => { this.BMI(this.AdrRelative()) }, /** BMI rel	*/
        0x31: () => { this.AND(this.Storage[this.AdrIndirectY()]) }, /** AND ind,Y	*/
        0x35: () => { this.AND(this.Storage[this.AdrZeropageX()]) }, /** AND zpg,X	*/
        0x36: () => { this.ROL(this.AdrZeropageX()) }, /** ROL zpg,X	*/
        0x38: () => { this.SEC() }, /** SEC impl	*/
        0x39: () => { this.AND(this.Storage[this.AdrAbsoluteY()]) }, /** AND abs,Y	*/
        0x3D: () => { this.AND(this.Storage[this.AdrAbsoluteX()]) }, /** AND abs,X	*/
        0x3E: () => { this.ROL(this.AdrAbsoluteX()) }, /** ROL abs,X	*/
        0x40: () => { this.RTI() }, /** RTI impl	*/
        0x41: () => { this.EOR(this.Storage[this.AdrXIndirect()]) }, /** EOR X,ind	*/
        0x45: () => { this.EOR(this.Storage[this.AdrZeropage()]) }, /** EOR zpg	*/
        0x46: () => { this.LSR(this.AdrZeropage()) }, /** LSR zpg	*/
        0x48: () => { this.PHA() }, /** PHA impl	*/
        0x49: () => { this.EOR(this.nextByte()) }, /** EOR #	    */
        0x4A: () => { this.LSR() }, /** LSR A	    */
        0x4C: () => { this.JMP(this.AdrAbsolute()) }, /** JMP abs	*/
        0x4D: () => { this.EOR(this.Storage[this.AdrAbsolute()]) }, /** EOR abs	*/
        0x4E: () => { this.LSR(this.AdrAbsolute()) }, /** LSR abs	*/
        0x50: () => { this.BVC(this.AdrRelative()) }, /** BVC rel	*/
        0x51: () => { this.EOR(this.Storage[this.AdrIndirectY()]) }, /** EOR ind,Y	*/
        0x55: () => { this.EOR(this.Storage[this.AdrZeropageX()]) }, /** EOR zpg,X	*/
        0x56: () => { this.LSR(this.AdrZeropageX()) }, /** LSR zpg,X	*/
        0x58: () => { this.CLI() }, /** CLI impl	*/
        0x59: () => { this.EOR(this.Storage[this.AdrAbsoluteY()]) }, /** EOR abs,Y	*/
        0x5D: () => { this.EOR(this.Storage[this.AdrAbsoluteX()]) }, /** EOR abs,X	*/
        0x5E: () => { this.LSR(this.AdrAbsoluteX()) }, /** LSR abs,X	*/
        0x60: () => { this.RTS() }, /** RTS impl	*/
        0x61: () => { this.ADC(this.Storage[this.AdrXIndirect()]) }, /** ADC X,ind	*/
        0x65: () => { this.ADC(this.Storage[this.AdrZeropage()]) }, /** ADC zpg	*/
        0x66: () => { this.ROR(this.AdrZeropage()) }, /** ROR zpg	*/
        0x68: () => { this.PLA() }, /** PLA impl	*/
        0x69: () => { this.ADC(this.nextByte()) }, /** ADC #	    */
        0x6A: () => { this.ROR() }, /** ROR A	    */
        0x6C: () => { this.JMP(this.AdrIndirect()) }, /** JMP ind	*/
        0x6D: () => { this.ADC(this.Storage[this.AdrAbsolute()]) }, /** ADC abs	*/
        0x6E: () => { this.ROR(this.AdrAbsolute()) }, /** ROR abs	*/
        0x70: () => { this.BVS(this.AdrRelative()) }, /** BVS rel	*/
        0x71: () => { this.ADC(this.Storage[this.AdrIndirectY()]) }, /** ADC ind,Y	*/
        0x75: () => { this.ADC(this.Storage[this.AdrZeropageX()]) }, /** ADC zpg,X	*/
        0x76: () => { this.ROR(this.AdrZeropageX()) }, /** ROR zpg,X	*/
        0x78: () => { this.SEI() }, /** SEI impl	*/
        0x79: () => { this.ADC(this.Storage[this.AdrAbsoluteY()]) }, /** ADC abs,Y	*/
        0x7D: () => { this.ADC(this.Storage[this.AdrAbsoluteX()]) }, /** ADC abs,X	*/
        0x7E: () => { this.ROR(this.AdrAbsoluteX()) }, /** ROR abs,X	*/
        0x81: () => { this.STA(this.AdrXIndirect()) }, /** STA X,ind	*/
        0x84: () => { this.STY(this.AdrZeropage()) }, /** STY zpg	*/
        0x85: () => { this.STA(this.AdrZeropage()) }, /** STA zpg	*/
        0x86: () => { this.STX(this.AdrZeropage()) }, /** STX zpg	*/
        0x88: () => { this.DEY() }, /** DEY impl	*/
        0x8A: () => { this.TXA() }, /** TXA impl	*/
        0x8C: () => { this.STY(this.AdrAbsolute()) }, /** STY abs	*/
        0x8D: () => { this.STA(this.AdrAbsolute()) }, /** STA abs	*/
        0x8E: () => { this.STX(this.AdrAbsolute()) }, /** STX abs	*/
        0x90: () => { this.BCC(this.AdrRelative()) }, /** BCC rel	*/
        0x91: () => { this.STA(this.AdrIndirectY()) }, /** STA ind,Y	*/
        0x94: () => { this.STY(this.AdrZeropageX()) }, /** STY zpg,X	*/
        0x95: () => { this.STA(this.AdrZeropageX()) }, /** STA zpg,X	*/
        0x96: () => { this.STX(this.AdrZeropageY()) }, /** STX zpg,Y	*/
        0x98: () => { this.TYA() }, /** TYA impl	*/
        0x99: () => { this.STA(this.AdrAbsoluteY()) }, /** STA abs,Y	*/
        0x9A: () => { this.TXS() }, /** TXS impl	*/
        0x9D: () => { this.STA(this.AdrAbsoluteX()) }, /** STA abs,X	*/
        0xA0: () => { this.LDY(this.nextByte()) }, /** LDY #	    */
        0xA1: () => { this.LDA(this.Storage[this.AdrXIndirect()]) }, /** LDA X,ind	*/
        0xA2: () => { this.LDX(this.nextByte()) }, /** LDX #	    */
        0xA4: () => { this.LDY(this.Storage[this.AdrZeropage()]) }, /** LDY zpg	*/
        0xA5: () => { this.LDA(this.Storage[this.AdrZeropage()]) }, /** LDA zpg	*/
        0xA6: () => { this.LDX(this.Storage[this.AdrZeropage()]) }, /** LDX zpg	*/
        0xA8: () => { this.TAY() }, /** TAY impl	*/
        0xA9: () => { this.LDA(this.nextByte()) }, /** LDA #	    */
        0xAA: () => { this.TAX() }, /** TAX impl	*/
        0xAC: () => { this.LDY(this.Storage[this.AdrAbsolute()]) }, /** LDY abs	*/
        0xAD: () => { this.LDA(this.Storage[this.AdrAbsolute()]) }, /** LDA abs	*/
        0xAE: () => { this.LDX(this.Storage[this.AdrAbsolute()]) }, /** LDX abs	*/
        0xB0: () => { this.BCS(this.AdrRelative()) }, /** BCS rel	*/
        0xB1: () => { this.LDA(this.Storage[this.AdrIndirectY()]) }, /** LDA ind,Y	*/
        0xB4: () => { this.LDY(this.Storage[this.AdrZeropageX()]) }, /** LDY zpg,X	*/
        0xB5: () => { this.LDA(this.Storage[this.AdrZeropageX()]) }, /** LDA zpg,X	*/
        0xB6: () => { this.LDX(this.Storage[this.AdrZeropageY()]) }, /** LDX zpg,Y	*/
        0xB8: () => { this.CLV() }, /** CLV impl	*/
        0xB9: () => { this.LDA(this.Storage[this.AdrAbsoluteY()]) }, /** LDA abs,Y	*/
        0xBA: () => { this.TSX() }, /** TSX impl	*/
        0xBC: () => { this.LDY(this.Storage[this.AdrAbsoluteX()]) }, /** LDY abs,X	*/
        0xBD: () => { this.LDA(this.Storage[this.AdrAbsoluteX()]) }, /** LDA abs,X	*/
        0xBE: () => { this.LDX(this.Storage[this.AdrAbsoluteY()]) }, /** LDX abs,Y	*/
        0xC0: () => { this.CPY(this.nextByte()) }, /** CPY #	    */
        0xC1: () => { this.CMP(this.Storage[this.AdrXIndirect()]) }, /** CMP X,ind	*/
        0xC4: () => { this.CPY(this.Storage[this.AdrZeropage()]) }, /** CPY zpg	*/
        0xC5: () => { this.CMP(this.Storage[this.AdrZeropage()]) }, /** CMP zpg	*/
        0xC6: () => { this.DEC(this.AdrZeropage()) }, /** DEC zpg	*/
        0xC8: () => { this.INY() }, /** INY impl	*/
        0xC9: () => { this.CMP(this.nextByte()) }, /** CMP #	    */
        0xCA: () => { this.DEX() }, /** DEX impl	*/
        0xCC: () => { this.CPY(this.Storage[this.AdrAbsolute()]) }, /** CPY abs	*/
        0xCD: () => { this.CMP(this.Storage[this.AdrAbsolute()]) }, /** CMP abs	*/
        0xCE: () => { this.DEC(this.AdrAbsolute()) }, /** DEC abs	*/
        0xD0: () => { this.BNE(this.AdrRelative()) }, /** BNE rel	*/
        0xD1: () => { this.CMP(this.Storage[this.AdrIndirectY()]) }, /** CMP ind,Y	*/
        0xD5: () => { this.CMP(this.Storage[this.AdrZeropageX()]) }, /** CMP zpg,X	*/
        0xD6: () => { this.DEC(this.AdrZeropageX()) }, /** DEC zpg,X	*/
        0xD8: () => { this.CLD() }, /** CLD impl	*/
        0xD9: () => { this.CMP(this.Storage[this.AdrAbsoluteY()]) }, /** CMP abs,Y	*/
        0xDD: () => { this.CMP(this.Storage[this.AdrAbsoluteX()]) }, /** CMP abs,X	*/
        0xDE: () => { this.DEC(this.AdrAbsoluteX()) }, /** DEC abs,X	*/
        0xE0: () => { this.CPX(this.nextByte()) }, /** CPX #	    */
        0xE1: () => { this.SBC(this.Storage[this.AdrXIndirect()]) }, /** SBC X,ind	*/
        0xE4: () => { this.CPX(this.Storage[this.AdrZeropage()]) }, /** CPX zpg	*/
        0xE5: () => { this.SBC(this.Storage[this.AdrZeropage()]) }, /** SBC zpg	*/
        0xE6: () => { this.INC(this.AdrZeropage()) }, /** INC zpg	*/
        0xE8: () => { this.INX() }, /** INX impl	*/
        0xE9: () => { this.SBC(this.nextByte()) }, /** SBC #	    */
        0xEA: () => { this.NOP() }, /** NOP impl	*/
        0xEC: () => { this.CPX(this.Storage[this.AdrAbsolute()]) }, /** CPX abs	*/
        0xED: () => { this.SBC(this.Storage[this.AdrAbsolute()]) }, /** SBC abs	*/
        0xEE: () => { this.INC(this.AdrAbsolute()) }, /** INC abs	*/
        0xF0: () => { this.BEQ(this.AdrRelative()) }, /** BEQ rel	*/
        0xF1: () => { this.SBC(this.Storage[this.AdrIndirectY()]) }, /** SBC ind,Y	*/
        0xF5: () => { this.SBC(this.Storage[this.AdrZeropageX()]) }, /** SBC zpg,X	*/
        0xF6: () => { this.INC(this.AdrZeropageX()) }, /** INC zpg,X	*/
        0xF8: () => { this.SED() }, /** SED impl	*/
        0xF9: () => { this.SBC(this.Storage[this.AdrAbsoluteY()]) }, /** SBC abs,Y	*/
        0xFA: () => { this.LOG() }, /** LOG impl */
        0xFD: () => { this.SBC(this.Storage[this.AdrAbsoluteX()]) }, /** SBC abs,X	*/
        0xFE: () => { this.INC(this.AdrAbsoluteX()) }, /** INC abs,X	*/
    }
    //#endregion
}
