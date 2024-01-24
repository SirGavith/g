include ../libs/byte.g;

let byte x = 1;
x += 3;
let byte y = ((x + 2) - (1 + 2));
y == 3;