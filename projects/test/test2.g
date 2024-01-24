4 + 3;


operator + byte (byte n1, byte n2) {
    return asm {
        CLC;
        LDA n1;
        ADC n2;
    };
};
