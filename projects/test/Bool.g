def byte true = 1
def byte false = 0

struct Bool_struct {
    byte value,
}

class Bool : Bool_struct {
    operator'=='(Bool a, Bool b): Bool {
        if (a.value == b.value) {
            return true
        }
        return false
    }
}