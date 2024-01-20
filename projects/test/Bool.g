def byte true = 1;
def byte false = 0;

struct bool_struct {
    byte value
};

class bool : bool_struct {
    operator '==' (bool a, bool b): bool {
        if (a.value == b.value) {
            return true;
        }
        return false;
    }
}