asm {
    defineAddress DATA_DIRECTION_B: $6002
    defineAddress OUTPUT_B: $6000
}

func write(byte val, address address): void {
    asm {
        LDA val      //not sure this is perfect
        STA address
    }
}

write(0xff, DATA_DIRECTION_B);
let byte val = 0x50;

while (true) {
    write(val, OUTPUT_B);
    val = val >> 1;
};

/*
compiles to:

defineAddress DATA_DIRECTION_B: $6002
defineAddress OUTPUT_B: $6000


// write(0xff, DATA_DIRECTION_B);


alloc val
LDA $50
STA val

@while_123

write(val, OUTPUT_B);

LDA val
ROR
STA val
val = val >> 1;

JMP while_123


@write



*/