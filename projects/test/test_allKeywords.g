asm {
    defineAddress DATA_DIRECTION_B: $6002;
    defineAddress OUTPUT_B: $6000;
};

// class bool : bool {
// 
// };


let byte my_variable0 = 0x12;
let byte my_variable1;
let byte my_variable2 = 84;

my_function(5);

func void my_function(byte number) {
    if (number == 5) {
        my_variable2 = 0;
    };
};

let byte i = 0;
if (i == 0) {
    my_variable1 = 3;
};

34;

i++;

operator == byte (byte n1, byte n2) {
    asm {
        LDA n1;
        CMP n2; //idk abt implementation
    };
    return;
};

return my_variable0;

struct bool {
    byte value
};

i;

while (i < 10) {
    i++;
};