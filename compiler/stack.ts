export const stackAssembly: string[] =`
// STACK CODE
defineAddress framePtr: $00
defineAddress framePtrHI: $01
defineAddress stackPtr: $02
defineAddress stackPtrHI: $03

@init_stack
    LDA #$00
    STA stackPtr
    STA framePtr
    LDA #$40
    STA stackPtrHI
    STA framePtrHI
    LDA #0
    //fall down into pushStackFrame
//arg size - allocates A bytes on the stack (for params)
@pushStackFrame
    PHA
    // write framePtr to next 2 bytes of stack
    LDY #0
    LDA framePtr
    STA (stackPtr),Y
    INY
    LDA framePtrHI
    STA (stackPtr),Y
    //set frame ptr to stack ptr
    LDA stackPtr
    STA framePtr
    LDA stackPtrHI
    STA framePtrHI
    CLC
    PLA
    ADC #2
    //fall down into malloc
//arg size - allocates A bytes on the stack
@alloca
    //move stackPtr down A bytes
    CLC
    ADC stackPtr
    STA stackPtr
    LDA #0
    ADC stackPtrHI
    STA stackPtrHI
    RTS
@popStackFrame
    PHA
    // set stackPtr to framePtr
    LDA framePtr
    STA stackPtr
    LDA framePtrHI
    STA stackPtrHI
    // set framePtr to first two bytes of old frame
    LDY #0
    LDA (stackPtr),Y
    STA framePtr
    INY
    LDA (stackPtr),Y
    STA framePtrHI
    PLA
    RTS`.split('\n')