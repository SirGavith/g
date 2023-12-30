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
[back](InstructionsType.md#arithmetic-instructions)
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
[back](InstructionsType.md#logical-operations)
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
[back](InstructionsType.md#shift--rotate-instructions)
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
[back](InstructionsType.md#conditional-branch-instructions)
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
[back](InstructionsType.md#conditional-branch-instructions)
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
[back](InstructionsType.md#conditional-branch-instructions)
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
[back](InstructionsType.md#other)
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
[back](InstructionsType.md#conditional-branch-instructions)
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
[back](InstructionsType.md#conditional-branch-instructions)
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
[back](InstructionsType.md#conditional-branch-instructions)
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
[back](InstructionsType.md#interrupts)
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
[back](InstructionsType.md#conditional-branch-instructions)
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
[back](InstructionsType.md#conditional-branch-instructions)
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
[back](InstructionsType.md#flag-instructions)
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
[back](InstructionsType.md#flag-instructions)
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
[back](InstructionsType.md#flag-instructions)
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
[back](InstructionsType.md#flag-instructions)
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
[back](InstructionsType.md#comparisons)
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
[back](InstructionsType.md#comparisons)
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
[back](InstructionsType.md#comparisons)
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
[back](InstructionsType.md#decrements--increments)
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
[back](InstructionsType.md#decrements--increments)
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
[back](InstructionsType.md#decrements--increments)
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
[back](InstructionsType.md#logical-operations)
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
[back](InstructionsType.md#decrements--increments)
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
[back](InstructionsType.md#decrements--increments)
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
[back](InstructionsType.md#decrements--increments)
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
[back](InstructionsType.md#jumps--subroutines)
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
[back](InstructionsType.md#jumps--subroutines)
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
[back](InstructionsType.md#transfer-operations)
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
[back](InstructionsType.md#transfer-operations)
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
[back](InstructionsType.md#transfer-operations)
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
[back](InstructionsType.md#shift--rotate-instructions)
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
[back](InstructionsType.md#other)
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
[back](InstructionsType.md#logical-operations)
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
[back](InstructionsType.md#stack-instructions)
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
[back](InstructionsType.md#stack-instructions)
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
[back](InstructionsType.md#stack-instructions)
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
[back](InstructionsType.md#stack-instructions)
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
[back](InstructionsType.md#shift--rotate-instructions)
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
[back](InstructionsType.md#shift--rotate-instructions)
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
[back](InstructionsType.md#interrupts)
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
[back](InstructionsType.md#jumps--subroutines)
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
[back](InstructionsType.md#arithmetic-operations)
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
[back](InstructionsType.md#flag-instructions)
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
[back](InstructionsType.md#flag-instructions)
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
[back](InstructionsType.md#flag-instructions)
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
[back](InstructionsType.md#transfer-operations)
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
[back](InstructionsType.md#transfer-operations)
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
[back](InstructionsType.md#transfer-operations)
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
[back](InstructionsType.md#transfer-operations)
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
[back](InstructionsType.md#transfer-operations)
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
[back](InstructionsType.md#transfer-operations)
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
[back](InstructionsType.md#transfer-operations)
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
[back](InstructionsType.md#transfer-operations)
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
[back](InstructionsType.md#transfer-operations)
```
Transfer Index Y to Accumulator
Y -> A

NZCIDV
++----
```

|addressing|	assembler|	opc|	bytes|	cycles
| --- | --- | --- | --- | --- |
|implied|	TYA|	98|	1|	2  