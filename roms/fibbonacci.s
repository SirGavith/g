alloc a: $04

alloc arr[20]

// Constant one
define one: 1

LDA one
STA a
LDA #0

TAY  //Y used as index to generated arr

STA arr,Y
INY

@fib

ADC a
BCS end
STA arr,Y
INY

TAX
ADC a
STA arr,Y
INY
STA a
TXA

BCC fib

@end
LDA a
BRK