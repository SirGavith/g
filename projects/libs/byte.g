operator = void (byte n1, byte n2) {
    return asm {
        LDA n2; // not technically needed
    };
};

operator + byte (byte n1, byte n2) {
    return asm {
        CLC;
        LDA n1;
        ADC n2;
    };
};

operator += void (byte n1, byte n2) {
    return asm {
        CLC;
        LDA n1;
        ADC n2;
    };
};
operator ++ void (byte n1) {
    return asm {
        INC n1;
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
        RTS;
        @not_eq_byteEQbyte;
        LDA #0;
    };
};

operator != byte (byte a, byte b) {
    return asm {
        LDA a;
        CMP b;
        BNE not_eq_byteNEQbyte;
        LDA #0;
        RTS;
        @not_eq_byteNEQbyte;
        LDA #1;
    };
};

operator < byte (byte a, byte b) {
    return asm {
        LDA a;
        CMP b;
        BCC not_eq_byteLTHANbyte;
        LDA #0;
        RTS;
        @not_eq_byteLTHANbyte;
        LDA #1;
    };
};