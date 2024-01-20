def byte[20] arr;

def byte a = 0;
def byte b = 1;
def byte c;

for (byte i = 0; i < 20; i++) {
    arr[i] = a;
    c = b;
    b = a + b;
    a = c;
}
