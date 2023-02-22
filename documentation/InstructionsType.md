# Instructions by Type

## Transfer Instructions

    Load, store, interregister transfer

- [LDA - load accumulator](#lda)
- [LDX - load X](#ldx)
- [LDY - load Y](#ldy)
- [STA - store accumulator](#sta)
- [STX - store X](#stx)
- [STY - store Y](#sty)
- [TAX - transfer accumulator to X](#tax)
- [TAY - transfer accumulator to Y](#tay)
- [TSX - transfer stack pointer to X](#tsx)
- [TXA - transfer X to accumulator](#txa)
- [TXS - transfer X to stack pointer](#txs)
- [TYA - transfer Y to accumulator](#tya)

## Stack Instructions

    These instructions transfer the accumulator or status register (flags) to and from the stack. The processor stack is a last-in-first-out (LIFO) stack of 256 bytes length, implemented at addresses $0100 - $01FF. The stack grows down as new values are pushed onto it with the current insertion point maintained in the stack pointer register.
    (When a byte is pushed onto the stack, it will be stored in the address indicated by the value currently in the stack pointer, which will be then decremented by 1. Conversely, when a value is pulled from the stack, the stack pointer is incremented. The stack pointer is accessible by the TSX and TXS instructions.)

- [PHA - push accumulator](#pha)
- [PHP - push processor status register (with break flag set)](#php)
- [PLA - pull accumulator](#pla)
- [PLP - pull processor status register](#plp)

## Decrements & Increments

- [DEC - decrement (memory)](#dec)
- [DEX - decrement X](#dex)
- [DEY - decrement Y](#dey)
- [INC - increment (memory)](#inc)
- [INX - increment X](#inx)
- [INY - increment Y](#iny)

## Arithmetic Operations

- [ADC - add with carry (prepare by CLC)](#adc)
- [SBC - subtract with carry (prepare by SEC)](#sbc)

## Logical Operations

- [AND - and (with accumulator)](#and)
- [EOR - exclusive or (with accumulator)](#eor)
- [ORA - (inclusive) or with accumulator](#ora)

## Shift & Rotate Instructions

    All shift and rotate instructions preserve the bit shifted out in the carry flag.

- [ASL - arithmetic shift left (shifts in a zero bit on the right)](#asl)
- [LSR - logical shift right (shifts in a zero bit on the left)](#lsr)
- [ROL - rotate left (shifts in carry bit on the right)](#rol)
- [ROR - rotate right (shifts in zero bit on the left)](#ror)

## Flag Instructions

- [CLC - clear carry](#clc)
- [CLD - clear decimal (BCD arithmetics disabled)](#cld)
- [CLI - clear interrupt disable](#cli)
- [CLV - clear overflow](#clv)
- [SEC - set carry](#sec)
- [SED - set decimal (BCD arithmetics enabled)](#sed)
- [SEI - set interrupt disable](#sei)

## Comparisons

    Generally, comparison instructions subtract the operand from the given register without affecting this register. Flags are still set as with a normal subtraction and thus the relation of the two values becomes accessible by the Zero, Carry and Negative flags.
    (See the branch instructions below for how to evaluate flags.)
    Relation R − Op	Z	C	N
    Register < Operand	0	0	sign bit of result
    Register = Operand	1	1	0
    Register > Operand	0	1	sign bit of result

- [CMP - compare (with accumulator)](#cmp)
- [CPX - compare with X](#cpx)
- [CPY - compare with Y](#cpy)

## Conditional Branch Instructions

    Branch targets are relative, signed 8-bit address offsets. (An offset of #0 corresponds to the immedately following address — or a rather odd and expensive NOP.)

- [BCC - branch on carry clear](#bcc)
- [BCS - branch on carry set](#bcs)
- [BEQ - branch on equal (zero set)](#beq)
- [BMI - branch on minus (negative set)](#bmi)
- [BNE - branch on not equal (zero clear)](#bne)
- [BPL - branch on plus (negative clear)](#bpl)
- [BVC - branch on overflow clear](#bvc)
- [BVS - branch on overflow set](#bvs)

## Jumps & Subroutines

JSR and RTS affect the stack as the return address is pushed onto or pulled from the stack, respectively.
(JSR will first push the high-byte of the return address [PC+2] onto the stack, then the low-byte. The stack will then contain, seen from the bottom or from the most recently added byte, [PC+2]-L [PC+2]-H.)

- [JMP - jump](#jmp)
- [JSR - jump subroutine](#jsr)
- [RTS - return from subroutine](#rts)

## Interrupts

    A hardware interrupt (maskable IRQ and non-maskable NMI), will cause the processor to put first the address currently in the program counter onto the stack (in HB-LB order), followed by the value of the status register. (The stack will now contain, seen from the bottom or from the most recently added byte, SR PC-L PC-H with the stack pointer pointing to the address below the stored contents of status register.) Then, the processor will divert its control flow to the address provided in the two word-size interrupt vectors at $FFFA (IRQ) and $FFFE (NMI).
    A set interrupt disable flag will inhibit the execution of an IRQ, but not of a NMI, which will be executed anyways.
    The break instruction (BRK) behaves like a NMI, but will push the value of PC+2 onto the stack to be used as the return address. Also, as with any software initiated transfer of the status register to the stack, the break flag will be found set on the respective value pushed onto the stack. Then, control is transferred to the address in the NMI-vector at $FFFE.
    In any way, the interrupt disable flag is set to inhibit any further IRQ as control is transferred to the interrupt handler specified by the respective interrupt vector.

    The RTI instruction restores the status register from the stack and behaves otherwise like the JSR instruction. (The break flag is always ignored as the status is read from the stack, as it isn't a real processor flag anyway.)

- [BRK - break / software interrupt](#brk)
- [RTI - return from interrupt](#rti)

## Other

- [BIT - bit test (accumulator & memory)](#bit)
- [NOP - no operation](#nop)




# 
#
#

# Instructions, alphabetically, with detail

`*` add 1 to cycles if page boundary is crossed

`**` add 1 to cycles if branch occurs on same page, or
    add 2 to cycles if branch occurs to different page

## Legend to Flags:
|Flag | Meaning
|---|---
| `+` | modified
| `-` | not modified
| `1` | set
| `0` | cleared
| `6` | memory bit 6
| `7` | memory bit 7 


## ADC
```
Add Memory to Accumulator with Carry
A + M + C -> A, C

NZCIDV
+++--+
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|immediate|	ADC #oper|	69|	2|	2  
|zeropage|	ADC oper|	65|	2|	3  
|zeropage,X|	ADC oper,X|	75|	2|	4  
|absolute|	ADC oper|	6D|	3|	4  
|absolute,X|	ADC oper,X|	7D|	3|	4* 
|absolute,Y|	ADC oper,Y|	79|	3|	4* 
|(indirect,X)|	ADC (oper,X)|	61|	2|	6  
|(indirect),Y|	ADC (oper),Y|	71|	2|	5* 
## AND
```
AND Memory with Accumulator
A AND M -> A

NZCIDV
++----
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|immediate|	AND #oper|	29|	2|	2  
|zeropage|	AND oper|	25|	2|	3  
|zeropage,X|	AND oper,X|	35|	2|	4  
|absolute|	AND oper|	2D|	3|	4  
|absolute,X|	AND oper,X|	3D|	3|	4* 
|absolute,Y|	AND oper,Y|	39|	3|	4* 
|(indirect,X)|	AND (oper,X)|	21|	2|	6  
|(indirect),Y|	AND (oper),Y|	31|	2|	5* 
## ASL
```
Shift Left One Bit (Memory or Accumulator)
C <- [76543210] <- 0

NZCIDV
+++---
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|accumulator|	ASL A|	0A|	1|	2  
|zeropage|	ASL oper|	06|	2|	5  
|zeropage,X|	ASL oper,X|	16|	2|	6  
|absolute|	ASL oper|	0E|	3|	6  
|absolute,X|	ASL oper,X|	1E|	3|	7  
## BCC
```
Branch on Carry Clear
branch on C = 0

NZCIDV
------
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|relative|	BCC oper|	90|	2|	2**
## BCS
```
Branch on Carry Set
branch on C = 1

NZCIDV
------
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|relative|	BCS oper|	B0|	2|	2**
## BEQ
```
Branch on Result Zero
branch on Z = 1

NZCIDV
------
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|relative|	BEQ oper|	F0|	2|	2**
## BIT
```
Test Bits in Memory with Accumulator
Bits 7 and 6 of operand are transfered to bit 7 and 6 of SR (N,V)
Zero-flag is set to the result of operand AND accumulator.

A AND M, M7 -> N, M6 -> V

NZCIDV
7+---6
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|zeropage|	BIT oper|	24|	2|	3  
|absolute|	BIT oper|	2C|	3|	4  
## BMI
```
Branch on Result Minus
branch on N = 1

NZCIDV
------
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|relative|	BMI oper|	30|	2|	2**
## BNE
```
Branch on Result not Zero
branch on Z = 0

NZCIDV
------
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|relative|	BNE oper|	D0|	2|	2**
## BPL
```
Branch on Result Plus
branch on N = 0

NZCIDV
------
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|relative|	BPL oper|	10|	2|	2**
## BRK
```
Force Break
BRK initiates a software interrupt similar to a hardware interrupt (IRQ). The return address pushed to the stack is PC+2, providing an extra byte of spacing for a break mark (identifying a reason for the break.) The status register will be pushed to the stack with the break flag set to 1. However, when retrieved during RTI or by a PLP instruction, the break flag will be ignored. The interrupt disable flag is not set automatically.

interrupt, push PC+2, push SR

NZCIDV
---1--
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	BRK|	00|	1|	7  
## BVC
```
Branch on Overflow Clear
branch on V = 0

NZCIDV
------
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|relative|	BVC oper|	50|	2|	2**
## BVS
```
Branch on Overflow Set
branch on V = 1

NZCIDV
------
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|relative|	BVS oper|	70|	2|	2**
## CLC
```
Clear Carry Flag
0 -> C

NZCIDV
--0---
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	CLC|	18|	1|	2  
## CLD
```
Clear Decimal Mode
0 -> D

NZCIDV
----0-
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	CLD|	D8|	1|	2  
## CLI
```
Clear Interrupt Disable Bit
0 -> I

NZCIDV
---0--
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	CLI|	58|	1|	2  
## CLV
```
Clear Overflow Flag
0 -> V

NZCIDV
-----0
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	CLV|	B8|	1|	2  
## CMP
```
Compare Memory with Accumulator
A - M

NZCIDV
+++---
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|immediate|	CMP #oper|	C9|	2|	2  
|zeropage|	CMP oper|	C5|	2|	3  
|zeropage,X|	CMP oper,X|	D5|	2|	4  
|absolute|	CMP oper|	CD|	3|	4  
|absolute,X|	CMP oper,X|	DD|	3|	4* 
|absolute,Y|	CMP oper,Y|	D9|	3|	4* 
|(indirect,X)|	CMP (oper,X)|	C1|	2|	6  
|(indirect),Y|	CMP (oper),Y|	D1|	2|	5* 
## CPX
```
Compare Memory and Index X
X - M

NZCIDV
+++---
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|immediate|	CPX #oper|	E0|	2|	2  
|zeropage|	CPX oper|	E4|	2|	3  
|absolute|	CPX oper|	EC|	3|	4  
## CPY
```
Compare Memory and Index Y
Y - M

NZCIDV
+++---
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|immediate|	CPY #oper|	C0|	2|	2  
|zeropage|	CPY oper|	C4|	2|	3  
|absolute|	CPY oper|	CC|	3|	4  
## DEC
```
Decrement Memory by One
M - 1 -> M

NZCIDV
++----
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|zeropage|	DEC oper|	C6|	2|	5  
|zeropage,X|	DEC oper,X|	D6|	2|	6  
|absolute|	DEC oper|	CE|	3|	6  
|absolute,X|	DEC oper,X|	DE|	3|	7  
## DEX
```
Decrement Index X by One
X - 1 -> X

NZCIDV
++----
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	DEX|	CA|	1|	2  
## DEY
```
Decrement Index Y by One
Y - 1 -> Y

NZCIDV
++----
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	DEY|	88|	1|	2  
## EOR
```
Exclusive-OR Memory with Accumulator
A EOR M -> A

NZCIDV
++----
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|immediate|	EOR #oper|	49|	2|	2  
|zeropage|	EOR oper|	45|	2|	3  
|zeropage,X|	EOR oper,X|	55|	2|	4  
|absolute|	EOR oper|	4D|	3|	4  
|absolute,X|	EOR oper,X|	5D|	3|	4* 
|absolute,Y|	EOR oper,Y|	59|	3|	4* 
|(indirect,X)|	EOR (oper,X)|	41|	2|	6  
|(indirect),Y|	EOR (oper),Y|	51|	2|	5* 
## INC
```
Increment Memory by One
M + 1 -> M

NZCIDV
++----
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|zeropage|	INC oper|	E6|	2|	5  
|zeropage,X|	INC oper,X|	F6|	2|	6  
|absolute|	INC oper|	EE|	3|	6  
|absolute,X|	INC oper,X|	FE|	3|	7  
## INX
```
Increment Index X by One
X + 1 -> X

NZCIDV
++----
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	INX|	E8|	1|	2  
## INY
```
Increment Index Y by One
Y + 1 -> Y

NZCIDV
++----
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	INY|	C8|	1|	2  
## JMP
```
Jump to New Location
(PC+1) -> PCL 
(PC+2) -> PCH

NZCIDV
------
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|absolute|	JMP oper|	4C|	3|	3  
|indirect|	JMP (oper)|	6C|	3|	5  
## JSR
```
Jump to New Location Saving Return Address
push (PC+2)
(PC+1) -> PCL
(PC+2) -> PCH

NZCIDV
------
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|absolute|	JSR oper|	20|	3|	6  
## LDA
```
Load Accumulator with Memory
M -> A

NZCIDV
++----
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|immediate|	LDA #oper|	A9|	2|	2  
|zeropage|	LDA oper|	A5|	2|	3  
|zeropage,X|	LDA oper,X|	B5|	2|	4  
|absolute|	LDA oper|	AD|	3|	4  
|absolute,X|	LDA oper,X|	BD|	3|	4* 
|absolute,Y|	LDA oper,Y|	B9|	3|	4* 
|(indirect,X)|	LDA (oper,X)|	A1|	2|	6  
|(indirect),Y|	LDA (oper),Y|	B1|	2|	5* 
## LDX
```
Load Index X with Memory
M -> X

NZCIDV
++----
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|immediate|	LDX #oper|	A2|	2|	2  
|zeropage|	LDX oper|	A6|	2|	3  
|zeropage,Y|	LDX oper,Y|	B6|	2|	4  
|absolute|	LDX oper|	AE|	3|	4  
|absolute,Y|	LDX oper,Y|	BE|	3|	4* 
## LDY
```
Load Index Y with Memory
M -> Y

NZCIDV
++----
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|immediate|	LDY #oper|	A0|	2|	2  
|zeropage|	LDY oper|	A4|	2|	3  
|zeropage,X|	LDY oper,X|	B4|	2|	4  
|absolute|	LDY oper|	AC|	3|	4  
|absolute,X|	LDY oper,X|	BC|	3|	4* 
## LSR
```
Shift One Bit Right (Memory or Accumulator)
0 -> [76543210] -> C

NZCIDV
0++---
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|accumulator|	LSR A|	4A|	1|	2  
|zeropage|	LSR oper|	46|	2|	5  
|zeropage,X|	LSR oper,X|	56|	2|	6  
|absolute|	LSR oper|	4E|	3|	6  
|absolute,X|	LSR oper,X|	5E|	3|	7  
## NOP
```
No Operation
---

NZCIDV
------
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	NOP|	EA|	1|	2  
## ORA
```
OR Memory with Accumulator
A OR M -> A

NZCIDV
++----
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|immediate|	ORA #oper|	09|	2|	2  
|zeropage|	ORA oper|	05|	2|	3  
|zeropage,X|	ORA oper,X|	15|	2|	4  
|absolute|	ORA oper|	0D|	3|	4  
|absolute,X|	ORA oper,X|	1D|	3|	4* 
|absolute,Y|	ORA oper,Y|	19|	3|	4* 
|(indirect,X)|	ORA (oper,X)|	01|	2|	6  
|(indirect),Y|	ORA (oper),Y|	11|	2|	5* 
## PHA
```
Push Accumulator on Stack
push A

NZCIDV
------
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	PHA|	48|	1|	3  
## PHP
```
Push Processor Status on Stack
The status register will be pushed with the break flag and bit 5 set to 1. 
push SR

NZCIDV
------
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	PHP|	08|	1|	3  
## PLA
```
Pull Accumulator from Stack
pull A

NZCIDV
++----
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	PLA|	68|	1|	4  
## PLP
```
Pull Processor Status from Stack
The status register will be pulled with the break flag and bit 5 ignored.
pull SR

NZCIDV
from stack
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	PLP|	28|	1|	4  
## ROL
```
Rotate One Bit Left (Memory or Accumulator)
C <- [76543210] <- C

NZCIDV
+++---
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|accumulator|	ROL A|	2A|	1|	2  
|zeropage|	ROL oper|	26|	2|	5  
|zeropage,X|	ROL oper,X|	36|	2|	6  
|absolute|	ROL oper|	2E|	3|	6  
|absolute,X|	ROL oper,X|	3E|	3|	7  
## ROR
```
Rotate One Bit Right (Memory or Accumulator)
C -> [76543210] -> C

NZCIDV
+++---
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|accumulator|	ROR A|	6A|	1|	2  
|zeropage|	ROR oper|	66|	2|	5  
|zeropage,X|	ROR oper,X|	76|	2|	6  
|absolute|	ROR oper|	6E|	3|	6  
|absolute,X|	ROR oper,X|	7E|	3|	7  
## RTI
```
Return from Interrupt
The status register is pulled with the break flag and bit 5 ignored. Then PC is pulled from the stack.

pull SR, pull PC

NZCIDV
from stack
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	RTI|	40|	1|	6  
## RTS
```
Return from Subroutine
pull PC, PC+1 -> PC

NZCIDV
------
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	RTS|	60|	1|	6  
## SBC
```
Subtract Memory from Accumulator with Borrow
A - M - C -> A

NZCIDV
+++--+
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|immediate|	SBC #oper|	E9|	2|	2  
|zeropage|	SBC oper|	E5|	2|	3  
|zeropage,X|	SBC oper,X|	F5|	2|	4  
|absolute|	SBC oper|	ED|	3|	4  
|absolute,X|	SBC oper,X|	FD|	3|	4* 
|absolute,Y|	SBC oper,Y|	F9|	3|	4* 
|(indirect,X)|	SBC (oper,X)|	E1|	2|	6  
|(indirect),Y|	SBC (oper),Y|	F1|	2|	5* 
## SEC
```
Set Carry Flag
1 -> C

NZCIDV
--1---
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	SEC|	38|	1|	2  
## SED
```
Set Decimal Flag
1 -> D

NZCIDV
----1-
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	SED|	F8|	1|	2  
## SEI
```
Set Interrupt Disable Status
1 -> I

NZCIDV
---1--
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	SEI|	78|	1|	2  
## STA
```
Store Accumulator in Memory
A -> M

NZCIDV
------
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|zeropage|	STA oper|	85|	2|	3  
|zeropage,X|	STA oper,X|	95|	2|	4  
|absolute|	STA oper|	8D|	3|	4  
|absolute,X|	STA oper,X|	9D|	3|	5  
|absolute,Y|	STA oper,Y|	99|	3|	5  
|(indirect,X)|	STA (oper,X)|	81|	2|	6  
|(indirect),Y|	STA (oper),Y|	91|	2|	6  
## STX
```
Store Index X in Memory
X -> M

NZCIDV
------
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|zeropage|	STX oper|	86|	2|	3  
|zeropage,Y|	STX oper,Y|	96|	2|	4  
|absolute|	STX oper|	8E|	3|	4  
## STY
```
Sore Index Y in Memory
Y -> M

NZCIDV
------
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|zeropage|	STY oper|	84|	2|	3  
|zeropage,X|	STY oper,X|	94|	2|	4  
|absolute|	STY oper|	8C|	3|	4  
## TAX
```
Transfer Accumulator to Index X
A -> X

NZCIDV
++----
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	TAX|	AA|	1|	2  
## TAY
```
Transfer Accumulator to Index Y
A -> Y

NZCIDV
++----
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	TAY|	A8|	1|	2  
## TSX
```
Transfer Stack Pointer to Index X
SP -> X

NZCIDV
++----
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	TSX|	BA|	1|	2  
## TXA
```
Transfer Index X to Accumulator
X -> A

NZCIDV
++----
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	TXA|	8A|	1|	2  
## TXS
```
Transfer Index X to Stack Register
X -> SP

NZCIDV
------
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	TXS|	9A|	1|	2  
## TYA
```
Transfer Index Y to Accumulator
Y -> A

NZCIDV
++----
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	TYA|	98|	1|	2  