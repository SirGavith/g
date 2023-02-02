"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Emu6502 = exports.RuntimeError = void 0;
const Constants_1 = require("../../shared/Constants");
class CustomError extends Error {
    constructor(...message) { super(message.map(m => String(m)).join(' ')); this.name = this.constructor.name; }
}
class RuntimeError extends CustomError {
    constructor(...message) { super(message); this.name = this.constructor.name; }
}
exports.RuntimeError = RuntimeError;
class Emu6502 {
    Storage = new Uint8Array(0xFFFF);
    Debug = true;
    Running = true;
    //#region Registers
    registers16 = new Uint16Array(1);
    registers8 = new Uint8Array(5);
    get PC() { return this.registers16[0]; } // Program Counter
    set PC(n) { this.registers16[0] = n; } // Program Counter
    get A() { return this.registers8[0]; } // Accumulator
    set A(n) { this.registers8[0] = n; } // Accumulator
    get X() { return this.registers8[1]; } // X Register
    set X(n) { this.registers8[1] = n; } // X Register
    get Y() { return this.registers8[2]; } // Y Register
    set Y(n) { this.registers8[2] = n; } // Y Register
    get SP() { return this.registers8[3]; } // Stack Pointer
    set SP(n) { this.registers8[3] = n; } // Stack Pointer
    get SR() { return this.registers8[4]; } // Status Register [NV-BDIZC]
    set SR(n) { this.registers8[4] = n; } // Status Register [NV-BDIZC]
    get Negative() { return this.SR >> 7 & 1; }
    get Overflow() { return this.SR >> 6 & 1; }
    get Break() { return this.SR >> 4 & 1; }
    get Decimal() { return this.SR >> 3 & 1; }
    get Interrupt() { return this.SR >> 2 & 1; }
    get Zero() { return this.SR >> 1 & 1; }
    get Carry() { return this.SR & 1; }
    set Negative(n) { this.SR = this.SR & 0x7F | n << 7; }
    set Overflow(n) { this.SR = this.SR & 0xBF | n << 6; }
    set Break(n) { this.SR = this.SR & 0xEF | n << 4; }
    set Decimal(n) { this.SR = this.SR & 0xF7 | n << 3; }
    set Interrupt(n) { this.SR = this.SR & 0xFB | n << 2; }
    set Zero(n) { this.SR = this.SR & 0xFD | n << 1; }
    set Carry(n) { this.SR = this.SR & 0xFE | n; }
    setNZ = (n) => { this.Negative = n >> 8 & 1; this.Zero = n === 0 ? 1 : 0; };
    setNZC = (n, c) => { this.setNZ(n); this.Carry = c; };
    setNZA = (n) => { this.setNZ(n); this.A = n; };
    //#endregion
    //#region Execute Cycle
    Execute() {
        if (!this.Storage)
            throw new RuntimeError('Storage is empty');
        if (this.Storage.length !== 0x10000)
            throw new RuntimeError('Storage is of wrong size');
        this.PC = (this.Storage[Constants_1.ResetVector_HI] << 8) | this.Storage[Constants_1.ResetVector_LO];
        this.SP = 0xFF;
        this.setNZ(0);
        this.Interrupt = 1;
        if (this.Debug) {
            console.log(' PC  | ' +
                ' Opcode  | ' +
                ' Disassembled  |' +
                ' A  X  Y  SP |' +
                ' NV-BDIZC |' +
                ' $4 |' +
                ' $200 - $210 ');
        }
        while (this.Running && this.PC < this.Storage.length) {
            this.ExecuteInstruction();
            this.PC++;
        }
    }
    ExecuteInstruction() {
        const opcode = this.getOpcode();
        let counterString = this.PC.toString(16);
        let instString = undefined;
        let instructionBytes = [];
        let disass = undefined;
        if (this.Debug) {
            let addressMode = undefined;
            Constants_1.InstructionOpcodes.forEach((opcs, instr) => {
                for (const [mode, opc] of opcs.entries()) {
                    if (opc === opcode) {
                        instString = instr;
                        addressMode = mode;
                        break;
                    }
                }
            });
            if (addressMode === undefined || instString === undefined)
                throw new RuntimeError(`Cannot resolve opcode ${opcode}`);
            const bytes = Constants_1.AddressModeByteLengths.get(addressMode);
            const num = bytes === 3 ? (this.getOpcode(2) << 8 | this.getOpcode(1)).toString(16) :
                bytes === 2 ? this.getOpcode(1).toString(16) : '';
            // this.LogStatus()
            for (let i = this.PC; i < this.PC + bytes; i++) {
                instructionBytes.push(this.Storage[i]);
            }
            disass = addressMode === Constants_1.AddressModes.Absolute ? `$${num}` :
                addressMode === Constants_1.AddressModes.AbsoluteX ? `$${num},X` :
                    addressMode === Constants_1.AddressModes.AbsoluteY ? `$${num},Y` :
                        addressMode === Constants_1.AddressModes.Immediate ? `#$${num}` :
                            addressMode === Constants_1.AddressModes.Implied ? `` :
                                addressMode === Constants_1.AddressModes.Indirect ? `($${num})` :
                                    addressMode === Constants_1.AddressModes.IndirectX ? `($${num},X)` :
                                        addressMode === Constants_1.AddressModes.IndirectY ? `($${num}),Y` :
                                            addressMode === Constants_1.AddressModes.ZeropageR ? `$${num}` :
                                                addressMode === Constants_1.AddressModes.ZeropageX ? `$${num},X` :
                                                    addressMode === Constants_1.AddressModes.ZeropageY ? `$${num},Y` :
                                                        undefined;
        }
        this.Instructions[opcode]();
        if (this.Debug) {
            const watchArr = [];
            for (const val of this.Storage.slice(0x200, 0x210)) {
                watchArr.push(this.ToString(val, 2, 16));
            }
            console.log(counterString.padStart(4, '0') + ' | ' +
                instructionBytes
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join(' ').padEnd(8, ' ') + ' | ' +
                (instString + ' ' + disass).padEnd(14, ' ') + ' | ' +
                this.ToString(this.A, 2, 16) + ' ' +
                this.ToString(this.X, 2, 16) + ' ' +
                this.ToString(this.Y, 2, 16) + ' ' +
                this.ToString(this.SP, 2, 16) + ' | ' +
                this.ToString(this.SR, 8, 2) + ' | ' +
                //watches
                this.ToString(this.Storage[4], 2, 16) + ' | ' +
                watchArr.join(','));
        }
    }
    //#endregion
    //#region Execute Helper Methods
    getOpcode(offset = 0) { return this.Storage[this.PC + offset]; }
    nextByte() { this.PC++; return this.getOpcode(); }
    nextWord() { this.PC += 2; return this.getOpcode() << 8 | this.getOpcode(-1); }
    getRAMWord(memAddress) { return (this.Storage[(memAddress + 1) & 0xFF] << 8) | this.Storage[memAddress]; }
    StackPush(n) {
        this.Storage[this.SP & 0x100] = n;
        this.SP--;
    }
    StackPull() {
        this.SP++;
        const pull = this.Storage[this.SP & 0x100];
        this.Storage[this.SP & 0x100] = 0;
        return pull;
    }
    //#endregion
    //#region Helper Methods
    ToMultiString(n) {
        return `0b${n.toString(2)}  ${n.toString(10)}  \$${n.toString(16)}`;
    }
    ToString(n, length, base) {
        return n.toString(base).padStart(length, '0');
    }
    //#endregion
    //#region Address Mode Helpers
    AdrAbsolute() { return this.nextWord(); }
    AdrAbsoluteX() { return (this.nextWord() + this.X) & 0xFFFF; }
    AdrAbsoluteY() { return (this.nextWord() + this.Y) & 0xFFFF; }
    AdrIndirect() { return this.Storage[this.nextWord()]; }
    AdrXIndirect() { return this.getRAMWord(this.nextByte() + this.X); }
    AdrIndirectY() { return this.Storage[this.nextByte()] + this.Y; }
    AdrRelative() {
        const offset = this.nextByte();
        return ((offset & 0x80) === 0) ? offset : -(~offset + 1 & 0xFF);
    }
    AdrZeropage() { return this.nextByte(); }
    AdrZeropageX() { return (this.nextByte() + this.X) & 0xFF; }
    AdrZeropageY() { return (this.nextByte() + this.X) & 0xFF; }
    //#endregion
    //#region Instruction Methods
    /** @param arg Addition operand */
    ADC(arg) {
        const sum = this.A + arg + this.Carry;
        this.Carry = sum > 0xFF ? 1 : 0;
        this.Overflow = ~(this.A ^ arg) & (this.A ^ sum) & 0x80;
        this.setNZA(sum);
    }
    /** @param arg And operand */
    AND(arg) { this.setNZA(this.A & arg); }
    /** @param memAddress Memory address to ASL; defaults to A register */
    ASL(memAddress) {
        const val = memAddress ? this.Storage[memAddress] : this.A;
        this.Carry = val >> 7 & 1;
        if (memAddress) {
            this.Storage[memAddress] = val << 1 & 0xFF;
            this.setNZ(this.Storage[memAddress]);
        }
        else {
            //accumulator
            this.setNZA(this.A << 1 & 0xFF);
        }
    }
    /** @param arg Branch destination memory address */
    BCC(arg) { if (this.Carry === 0)
        this.PC += arg; }
    /** @param arg Branch destination memory address */
    BCS(arg) { if (this.Carry === 1)
        this.PC += arg; }
    /** @param arg Branch destination memory address */
    BEQ(arg) { if (this.Zero === 1)
        this.PC += arg; }
    /** @param arg Bit test operand */
    BIT(arg) {
        this.SR = this.SR & 0x3D | (arg & 0xC0) | ((this.A & arg) === 0 ? 2 : 0);
    }
    /** @param arg Branch destination memory address */
    BMI(arg) { if (this.Negative === 1)
        this.PC += arg; }
    /** @param arg Branch destination memory address */
    BNE(arg) { if (this.Zero === 0)
        this.PC += arg; }
    /** @param arg Branch destination memory address */
    BPL(arg) { if (this.Negative === 0)
        this.PC += arg; }
    BRK() {
        //for now, just halt
        this.Running = false;
    }
    /** @param arg Branch destination memory address */
    BVC(arg) { if (this.Overflow === 0)
        this.PC += arg; }
    /** @param arg Branch destination memory address */
    BVS(arg) { if (this.Overflow === 1)
        this.PC += arg; }
    CLC() { this.Carry = 0; }
    CLD() { this.Decimal = 0; }
    CLI() { this.Interrupt = 0; }
    CLV() { this.Overflow = 0; }
    /** @param arg Compare operand */
    CMP(arg) { this.setNZC(this.A - arg, this.A >= arg ? 1 : 0); }
    /** @param arg Compare operand */
    CPX(arg) { this.setNZC(this.X - arg, this.A >= arg ? 1 : 0); }
    /** @param arg Compare operand */
    CPY(arg) { this.setNZC(this.Y - arg, this.A >= arg ? 1 : 0); }
    /** @param memAddress DEC memAddress */
    DEC(memAddress) { this.setNZ(this.Storage[memAddress] - 1); }
    DEX() { this.setNZ(--this.X); }
    DEY() { this.setNZ(--this.X); }
    /** @param arg Compare operand */
    EOR(arg) { this.setNZA(this.A ^ arg); }
    /** @param memAddress INC Destination memAddress */
    INC(memAddress) { this.setNZ(++this.Storage[memAddress]); }
    INX() { this.setNZ(++this.X); }
    INY() { this.setNZ(++this.Y); }
    /** @param arg Jump destination memory address */
    JMP(arg) { this.PC = arg; }
    /** @param arg JSR subroutine memory address */
    JSR(arg) {
        this.StackPush(this.PC + 2);
        this.PC = arg;
    }
    /** @param arg LDA value */
    LDA(arg) { this.setNZA(arg); }
    /** @param arg LDX value */
    LDX(arg) { this.X = arg; }
    /** @param arg LDY value */
    LDY(arg) { this.Y = arg; }
    LOG() { console.log(`0b${this.A.toString(2)}   ${this.A.toString(10)}   0x${this.A.toString(16)}`); }
    /** @param memAddress Memory address to LSR; defaults to A register */
    LSR(memAddress) {
        const val = memAddress ? this.Storage[memAddress] : this.A;
        this.Carry = val & 1;
        if (memAddress) {
            this.setNZ(this.Storage[memAddress]);
            this.Storage[memAddress] = (val >> 1) & 0xFF;
        }
        else {
            //accumulator
            this.setNZA((val >> 1) & 0xFF);
        }
    }
    NOP() { }
    /** @param arg ORA value */
    ORA(arg) { this.setNZA(this.A | arg); }
    PHA() { this.StackPush(this.A); }
    PHP() { this.StackPush(this.SR | 0x30); }
    PLA() { this.setNZA(this.StackPull()); }
    PLP() { this.SR = this.StackPull() & 0xCF; }
    /** @param memAddress Memory address to ROL; defaults to A register */
    ROL(memAddress) {
        const val = memAddress ? this.Storage[memAddress] : this.A;
        const c = this.Carry;
        this.Carry = val >> 7 & 1;
        if (memAddress) {
            this.Storage[memAddress] = val << 1 | c & 0xFF;
            this.setNZ(this.Storage[memAddress]);
        }
        else {
            this.setNZA(val << 1 | c & 0xFF);
        }
    }
    /** @param memAddress Memory address to ROR; defaults to A register */
    ROR(memAddress) {
        const val = memAddress ? this.Storage[memAddress] : this.A;
        const c = this.Carry;
        this.Carry = val & 1;
        if (memAddress) {
            this.Storage[memAddress] = val >> 1 | (c << 7);
            this.setNZ(this.Storage[memAddress]);
        }
        else {
            this.setNZA(val >> 1 | (c << 7));
        }
    }
    RTI() {
        this.PLP();
        this.PC = this.StackPull();
    }
    RTS() { this.PC = this.StackPull() + 1; }
    /** @param arg SBC operand */
    SBC(arg) { this.ADC(~arg); }
    SEC() { this.Carry = 1; }
    SED() { this.Decimal = 1; }
    SEI() { this.Interrupt = 1; }
    /** @param memAddress STA Destination memAddress */
    STA(memLocation) { this.Storage[memLocation] = this.A; }
    /** @param memAddress STX Destination memAddress */
    STX(memLocation) { this.Storage[memLocation] = this.X; }
    /** @param memAddress STA Destination memAddress */
    STY(memLocation) { this.Storage[memLocation] = this.Y; }
    TAX() { this.X = this.A; }
    TAY() { this.Y = this.A; }
    TSX() { this.X = this.SP; }
    TXA() { this.setNZA(this.X); }
    TXS() { this.SP = this.X; }
    TYA() { this.setNZA(this.Y); }
    //#endregion
    //#region Instructions by Opcode
    Instructions = {
        0x00: () => { this.BRK(); },
        0x01: () => { this.ORA(this.Storage[this.AdrXIndirect()]); },
        0x05: () => { this.ORA(this.Storage[this.AdrZeropage()]); },
        0x06: () => { this.ASL(this.AdrZeropage()); },
        0x08: () => { this.PHP(); },
        0x09: () => { this.ORA(this.nextByte()); },
        0x0A: () => { this.ASL(); },
        0x0D: () => { this.ORA(this.Storage[this.AdrAbsolute()]); },
        0x0E: () => { this.ASL(this.AdrAbsolute()); },
        0x10: () => { this.BPL(this.AdrRelative()); },
        0x11: () => { this.ORA(this.Storage[this.AdrIndirectY()]); },
        0x15: () => { this.ORA(this.Storage[this.AdrZeropageX()]); },
        0x16: () => { this.ASL(this.AdrZeropageX()); },
        0x18: () => { this.CLC(); },
        0x19: () => { this.ORA(this.Storage[this.AdrAbsoluteY()]); },
        0x1D: () => { this.ORA(this.Storage[this.AdrAbsoluteX()]); },
        0x1E: () => { this.ASL(this.AdrAbsoluteX()); },
        0x20: () => { this.JSR(this.AdrAbsolute()); },
        0x21: () => { this.AND(this.Storage[this.AdrXIndirect()]); },
        0x24: () => { this.BIT(this.Storage[this.AdrZeropage()]); },
        0x25: () => { this.AND(this.Storage[this.AdrZeropage()]); },
        0x26: () => { this.ROL(this.AdrZeropage()); },
        0x28: () => { this.PLP(); },
        0x29: () => { this.AND(this.nextByte()); },
        0x2A: () => { this.ROL(); },
        0x2C: () => { this.BIT(this.Storage[this.AdrAbsolute()]); },
        0x2D: () => { this.AND(this.Storage[this.AdrAbsolute()]); },
        0x2E: () => { this.ROL(this.AdrAbsolute()); },
        0x30: () => { this.BMI(this.AdrRelative()); },
        0x31: () => { this.AND(this.Storage[this.AdrIndirectY()]); },
        0x35: () => { this.AND(this.Storage[this.AdrZeropageX()]); },
        0x36: () => { this.ROL(this.AdrZeropageX()); },
        0x38: () => { this.SEC(); },
        0x39: () => { this.AND(this.Storage[this.AdrAbsoluteY()]); },
        0x3D: () => { this.AND(this.Storage[this.AdrAbsoluteX()]); },
        0x3E: () => { this.ROL(this.AdrAbsoluteX()); },
        0x40: () => { this.RTI(); },
        0x41: () => { this.EOR(this.Storage[this.AdrXIndirect()]); },
        0x45: () => { this.EOR(this.Storage[this.AdrZeropage()]); },
        0x46: () => { this.LSR(this.AdrZeropage()); },
        0x48: () => { this.PHA(); },
        0x49: () => { this.EOR(this.nextByte()); },
        0x4A: () => { this.LSR(); },
        0x4C: () => { this.JMP(this.AdrAbsolute()); },
        0x4D: () => { this.EOR(this.Storage[this.AdrAbsolute()]); },
        0x4E: () => { this.LSR(this.AdrAbsolute()); },
        0x50: () => { this.BVC(this.AdrRelative()); },
        0x51: () => { this.EOR(this.Storage[this.AdrIndirectY()]); },
        0x55: () => { this.EOR(this.Storage[this.AdrZeropageX()]); },
        0x56: () => { this.LSR(this.AdrZeropageX()); },
        0x58: () => { this.CLI(); },
        0x59: () => { this.EOR(this.Storage[this.AdrAbsoluteY()]); },
        0x5D: () => { this.EOR(this.Storage[this.AdrAbsoluteX()]); },
        0x5E: () => { this.LSR(this.AdrAbsoluteX()); },
        0x60: () => { this.RTS(); },
        0x61: () => { this.ADC(this.Storage[this.AdrXIndirect()]); },
        0x65: () => { this.ADC(this.Storage[this.AdrZeropage()]); },
        0x66: () => { this.ROR(this.AdrZeropage()); },
        0x68: () => { this.PLA(); },
        0x69: () => { this.ADC(this.nextByte()); },
        0x6A: () => { this.ROR(); },
        0x6C: () => { this.JMP(this.AdrIndirect()); },
        0x6D: () => { this.ADC(this.Storage[this.AdrAbsolute()]); },
        0x6E: () => { this.ROR(this.AdrAbsolute()); },
        0x70: () => { this.BVS(this.AdrRelative()); },
        0x71: () => { this.ADC(this.Storage[this.AdrIndirectY()]); },
        0x75: () => { this.ADC(this.Storage[this.AdrZeropageX()]); },
        0x76: () => { this.ROR(this.AdrZeropageX()); },
        0x78: () => { this.SEI(); },
        0x79: () => { this.ADC(this.Storage[this.AdrAbsoluteY()]); },
        0x7D: () => { this.ADC(this.Storage[this.AdrAbsoluteX()]); },
        0x7E: () => { this.ROR(this.AdrAbsoluteX()); },
        0x81: () => { this.STA(this.AdrXIndirect()); },
        0x84: () => { this.STY(this.AdrZeropage()); },
        0x85: () => { this.STA(this.AdrZeropage()); },
        0x86: () => { this.STX(this.AdrZeropage()); },
        0x88: () => { this.DEY(); },
        0x8A: () => { this.TXA(); },
        0x8C: () => { this.STY(this.AdrAbsolute()); },
        0x8D: () => { this.STA(this.AdrAbsolute()); },
        0x8E: () => { this.STX(this.AdrAbsolute()); },
        0x90: () => { this.BCC(this.AdrRelative()); },
        0x91: () => { this.STA(this.AdrIndirectY()); },
        0x94: () => { this.STY(this.AdrZeropageX()); },
        0x95: () => { this.STA(this.AdrZeropageX()); },
        0x96: () => { this.STX(this.AdrZeropageY()); },
        0x98: () => { this.TYA(); },
        0x99: () => { this.STA(this.AdrAbsoluteY()); },
        0x9A: () => { this.TXS(); },
        0x9D: () => { this.STA(this.AdrAbsoluteX()); },
        0xA0: () => { this.LDY(this.nextByte()); },
        0xA1: () => { this.LDA(this.Storage[this.AdrXIndirect()]); },
        0xA2: () => { this.LDX(this.nextByte()); },
        0xA4: () => { this.LDY(this.Storage[this.AdrZeropage()]); },
        0xA5: () => { this.LDA(this.Storage[this.AdrZeropage()]); },
        0xA6: () => { this.LDX(this.Storage[this.AdrZeropage()]); },
        0xA8: () => { this.TAY(); },
        0xA9: () => { this.LDA(this.nextByte()); },
        0xAA: () => { this.TAX(); },
        0xAC: () => { this.LDY(this.Storage[this.AdrAbsolute()]); },
        0xAD: () => { this.LDA(this.Storage[this.AdrAbsolute()]); },
        0xAE: () => { this.LDX(this.Storage[this.AdrAbsolute()]); },
        0xB0: () => { this.BCS(this.AdrRelative()); },
        0xB1: () => { this.LDA(this.Storage[this.AdrIndirectY()]); },
        0xB4: () => { this.LDY(this.Storage[this.AdrZeropageX()]); },
        0xB5: () => { this.LDA(this.Storage[this.AdrZeropageX()]); },
        0xB6: () => { this.LDX(this.Storage[this.AdrZeropageY()]); },
        0xB8: () => { this.CLV(); },
        0xB9: () => { this.LDA(this.Storage[this.AdrAbsoluteY()]); },
        0xBA: () => { this.TSX(); },
        0xBC: () => { this.LDY(this.Storage[this.AdrAbsoluteX()]); },
        0xBD: () => { this.LDA(this.Storage[this.AdrAbsoluteX()]); },
        0xBE: () => { this.LDX(this.Storage[this.AdrAbsoluteY()]); },
        0xC0: () => { this.CPY(this.nextByte()); },
        0xC1: () => { this.CMP(this.Storage[this.AdrXIndirect()]); },
        0xC4: () => { this.CPY(this.Storage[this.AdrZeropage()]); },
        0xC5: () => { this.CMP(this.Storage[this.AdrZeropage()]); },
        0xC6: () => { this.DEC(this.AdrZeropage()); },
        0xC8: () => { this.INY(); },
        0xC9: () => { this.CMP(this.nextByte()); },
        0xCA: () => { this.DEX(); },
        0xCC: () => { this.CPY(this.Storage[this.AdrAbsolute()]); },
        0xCD: () => { this.CMP(this.Storage[this.AdrAbsolute()]); },
        0xCE: () => { this.DEC(this.AdrAbsolute()); },
        0xD0: () => { this.BNE(this.AdrRelative()); },
        0xD1: () => { this.CMP(this.Storage[this.AdrIndirectY()]); },
        0xD5: () => { this.CMP(this.Storage[this.AdrZeropageX()]); },
        0xD6: () => { this.DEC(this.AdrZeropageX()); },
        0xD8: () => { this.CLD(); },
        0xD9: () => { this.CMP(this.Storage[this.AdrAbsoluteY()]); },
        0xDD: () => { this.CMP(this.Storage[this.AdrAbsoluteX()]); },
        0xDE: () => { this.DEC(this.AdrAbsoluteX()); },
        0xE0: () => { this.CPX(this.nextByte()); },
        0xE1: () => { this.SBC(this.Storage[this.AdrXIndirect()]); },
        0xE4: () => { this.CPX(this.Storage[this.AdrZeropage()]); },
        0xE5: () => { this.SBC(this.Storage[this.AdrZeropage()]); },
        0xE6: () => { this.INC(this.AdrZeropage()); },
        0xE8: () => { this.INX(); },
        0xE9: () => { this.SBC(this.nextByte()); },
        0xEA: () => { this.NOP(); },
        0xEC: () => { this.CPX(this.Storage[this.AdrAbsolute()]); },
        0xED: () => { this.SBC(this.Storage[this.AdrAbsolute()]); },
        0xEE: () => { this.INC(this.AdrAbsolute()); },
        0xF0: () => { this.BEQ(this.AdrRelative()); },
        0xF1: () => { this.SBC(this.Storage[this.AdrIndirectY()]); },
        0xF5: () => { this.SBC(this.Storage[this.AdrZeropageX()]); },
        0xF6: () => { this.INC(this.AdrZeropageX()); },
        0xF8: () => { this.SED(); },
        0xF9: () => { this.SBC(this.Storage[this.AdrAbsoluteY()]); },
        0xFA: () => { this.LOG(); },
        0xFD: () => { this.SBC(this.Storage[this.AdrAbsoluteX()]); },
        0xFE: () => { this.INC(this.AdrAbsoluteX()); }, /** INC abs,X	*/
    };
}
exports.Emu6502 = Emu6502;
