let byte x = 1;
let byte y = ((x + 2) * (5 - 3));

operator + byte (byte n1, byte n2) {
    return asm {
        LDA n1;
        ADC n2;
    };
};

operator - byte (byte n1, byte n2) {
    return asm {
        LDA n1;
        SBC n2;
    };
};

operator == byte (byte n1, byte n2) {
    return asm {
        LDA n1;
        CPA n2;
        BNE @not_eq;
        LDA #0;
        RTS;
        @zero_clear;
        LDA #1;
        RTS;
    };
}
