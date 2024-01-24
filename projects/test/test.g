include ../libs/byte.g;

let byte a = 4;
let byte b = 1;

if (a > b) {
    let byte c = 0;
    c++;
}
else {
    a--;
};

b += a;

while (b > 0) {
    b--;
};