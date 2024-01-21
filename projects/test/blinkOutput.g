asm {
    defineAddress DATA_DIRECTION_B: $6002;
    defineAddress OUTPUT_B: $6000;
};

func void write(byte val, address address) {
    asm {
        LDA val;      //not sure this is perfect
        STA address;
    };
};

write(0xff, DATA_DIRECTION_B);
let byte val = 0x50;

while (true) {
    write(val, OUTPUT_B);
    val = val >> 1;
};