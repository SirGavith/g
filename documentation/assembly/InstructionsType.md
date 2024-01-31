# Instructions by Type

## Transfer Instructions

    Load, store, interregister transfer

- [LDA - load accumulator](Inst.md#lda)
- [LDX - load X](Inst.md#ldx)
- [LDY - load Y](Inst.md#ldy)
- [STA - store accumulator](Inst.md#sta)
- [STX - store X](Inst.md#stx)
- [STY - store Y](Inst.md#sty)
- [TAX - transfer accumulator to X](Inst.md#tax)
- [TAY - transfer accumulator to Y](Inst.md#tay)
- [TSX - transfer stack pointer to X](Inst.md#tsx)
- [TXA - transfer X to accumulator](Inst.md#txa)
- [TXS - transfer X to stack pointer](Inst.md#txs)
- [TYA - transfer Y to accumulator](Inst.md#tya)

## Stack Instructions

    These instructions transfer the accumulator or status register (flags) to and from the stack. The processor stack is a last-in-first-out (LIFO) stack of 256 bytes length, implemented at addresses $0100 - $01FF. The stack grows down as new values are pushed onto it with the current insertion point maintained in the stack pointer register.
    (When a byte is pushed onto the stack, it will be stored in the address indicated by the value currently in the stack pointer, which will be then decremented by 1. Conversely, when a value is pulled from the stack, the stack pointer is incremented. The stack pointer is accessible by the TSX and TXS instructions.)

- [PHA - push accumulator](Inst.md#pha)
- [PHP - push processor status register (with break flag set)](Inst.md#php)
- [PLA - pull accumulator](Inst.md#pla)
- [PLP - pull processor status register](Inst.md#plp)

## Decrements & Increments

- [DEC - decrement (memory)](Inst.md#dec)
- [DEX - decrement X](Inst.md#dex)
- [DEY - decrement Y](Inst.md#dey)
- [INC - increment (memory)](Inst.md#inc)
- [INX - increment X](Inst.md#inx)
- [INY - increment Y](Inst.md#iny)

## Arithmetic Operations

- [ADC - add with carry (prepare by CLC)](Inst.md#adc)
- [SBC - subtract with carry (prepare by SEC)](Inst.md#sbc)

## Logical Operations

- [AND - and (with accumulator)](Inst.md#and)
- [EOR - exclusive or (with accumulator)](Inst.md#eor)
- [ORA - (inclusive) or with accumulator](Inst.md#ora)

## Shift & Rotate Instructions

    All shift and rotate instructions preserve the bit shifted out in the carry flag.

- [ASL - arithmetic shift left (shifts in a zero bit on the right)](Inst.md#asl)
- [LSR - logical shift right (shifts in a zero bit on the left)](Inst.md#lsr)
- [ROL - rotate left (shifts in carry bit on the right)](Inst.md#rol)
- [ROR - rotate right (shifts in zero bit on the left)](Inst.md#ror)

## Flag Instructions

- [CLC - clear carry](Inst.md#clc)
- [CLD - clear decimal (BCD arithmetics disabled)](Inst.md#cld)
- [CLI - clear interrupt disable](Inst.md#cli)
- [CLV - clear overflow](Inst.md#clv)
- [SEC - set carry](Inst.md#sec)
- [SED - set decimal (BCD arithmetics enabled)](Inst.md#sed)
- [SEI - set interrupt disable](Inst.md#sei)

## Comparisons

    Generally, comparison instructions subtract the operand from the given register without affecting this register. Flags are still set as with a normal subtraction and thus the relation of the two values becomes accessible by the Zero, Carry and Negative flags.
    (See the branch instructions below for how to evaluate flags.)
    Relation    R − Op	Z	C	N
    Register < Operand	0	0	sign bit of result
    Register = Operand	1	1	0
    Register > Operand	0	1	sign bit of result

- [CMP - compare (with accumulator)](Inst.md#cmp)
- [CPX - compare with X](Inst.md#cpx)
- [CPY - compare with Y](Inst.md#cpy)

## Conditional Branch Instructions

    Branch targets are relative, signed 8-bit address offsets. (An offset of Inst.md#0 corresponds to the immedately following address — or a rather odd and expensive NOP.)

- [BCC - branch on carry clear](Inst.md#bcc)
- [BCS - branch on carry set](Inst.md#bcs)
- [BEQ - branch on equal (zero set)](Inst.md#beq)
- [BMI - branch on minus (negative set)](Inst.md#bmi)
- [BNE - branch on not equal (zero clear)](Inst.md#bne)
- [BPL - branch on plus (negative clear)](Inst.md#bpl)
- [BVC - branch on overflow clear](Inst.md#bvc)
- [BVS - branch on overflow set](Inst.md#bvs)

## Jumps & Subroutines

JSR and RTS affect the stack as the return address is pushed onto or pulled from the stack, respectively.
(JSR will first push the high-byte of the return address [PC+2] onto the stack, then the low-byte. The stack will then contain, seen from the bottom or from the most recently added byte, [PC+2]-L [PC+2]-H.)

- [JMP - jump](Inst.md#jmp)
- [JSR - jump subroutine](Inst.md#jsr)
- [RTS - return from subroutine](Inst.md#rts)

## Interrupts

    A hardware interrupt (maskable IRQ and non-maskable NMI), will cause the processor to put first the address currently in the program counter onto the stack (in HB-LB order), followed by the value of the status register. (The stack will now contain, seen from the bottom or from the most recently added byte, SR PC-L PC-H with the stack pointer pointing to the address below the stored contents of status register.) Then, the processor will divert its control flow to the address provided in the two word-size interrupt vectors at $FFFA (IRQ) and $FFFE (NMI).
    A set interrupt disable flag will inhibit the execution of an IRQ, but not of a NMI, which will be executed anyways.
    The break instruction (BRK) behaves like a NMI, but will push the value of PC+2 onto the stack to be used as the return address. Also, as with any software initiated transfer of the status register to the stack, the break flag will be found set on the respective value pushed onto the stack. Then, control is transferred to the address in the NMI-vector at $FFFE.
    In any way, the interrupt disable flag is set to inhibit any further IRQ as control is transferred to the interrupt handler specified by the respective interrupt vector.

    The RTI instruction restores the status register from the stack and behaves otherwise like the JSR instruction. (The break flag is always ignored as the status is read from the stack, as it isn't a real processor flag anyway.)

- [BRK - break / software interrupt](Inst.md#brk)
- [RTI - return from interrupt](Inst.md#rti)

## Other

- [BIT - bit test (accumulator & memory)](Inst.md#bit)
- [NOP - no operation](Inst.md#nop)