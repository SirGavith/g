let byte x = 1;
x += 3;
let byte y = ((x + 2) - (1 + 2));
y == 3;

operator = void (byte n1, byte n2) {
    return asm {
        LDA n2; // not technically needed
    };
};

operator += void (byte n1, byte n2) {
    return asm {
        CLC;
        LDA n1;
        ADC n2;
    };
};

operator + byte (byte n1, byte n2) {
    return asm {
        CLC;
        LDA n1;
        ADC n2;
    };
};

operator - byte (byte n1, byte n2) {
    return asm {
        SEC;
        LDA n1;
        SBC n2;
    };
};

operator == byte (byte a, byte b) {
    return asm {
        LDA a;
        CMP b;
        BNE not_eq_byteEQbyte;
        LDA #1;
        JMP end_byteEQbyte;
        @not_eq_byteEQbyte;
        LDA #0;
        @end_byteEQbyte;
    };
};
