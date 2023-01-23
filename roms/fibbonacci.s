alloc a
// Constant one

define one: 1

LDA one
STA a
LDA #0

@fib

ADC a
BCS end
TAX
TAY
ADC a
STA a
TXA

BCC fib

@end
LDA a
BRK