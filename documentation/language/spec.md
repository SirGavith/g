# G lang

## General
- Trailing commas are ok

## Types
- `byte`
  - 1 byte
  - Initialized to `0`

## Assembly
``` 
asm {
    defineAddress DATA_DIRECTION_B: $6002
    defineAddress OUTPUT_B: $6000

    LDA $FF
    STA DATA_DIRECTION_B
}
```

## Literals
- Number literals produce bytes
- Char literals produce a byte of their ASCII
- `true` or `false` are just globals of the `bool` lib

## Libraries
- Each file can be imported to another file
- The default compilation step is of a single file
- If another file is imported, the two files will simply be combined
- The order of functions and classes does not matter


## Variables
```
let byte b;
let byte c = 20;
```

## Operators
- Binary operators (two args)
  - `==`
  - `!=`
  - `&&`
  - `||`
  - `+=`
  - `+`
  - `-=`
  - `-`
  - `*=`
  - `*`
  - `/=`
  - `/`
  - `%=`
  - `%`
  - `=`
  - `>=`
  - `>`
  - `<=`
  - `<`
- Unary prefix operators (one arg after operator)
  - `!`
- Unary posifix operators (one arg before operator)
  - `++`
  - `--`
- No operators are implemented by default, use libraries

## Expressions

## The stack
- What I need is runtime allocation on the stack.


## Functions
- Functions are not in a class
- Functions are defined with `func`
```
func bool isZero(byte a) {
    if (a == 0) {
        return true;
    };
    return false;
}
```


## Structs

``` 
struct XY_struct {
    byte x,
    byte y
}
```

## Classes
- Classes are extensions of structs
- Classes are defined as such:
  - `class`
  - Their unique identifier
  - `:`
  - The associated struct, which is `this` in the methods
  - `{`
  - Any number of comma-separated methods
  - `}`
- Classes may only contain methods, the associated struct contains all data
- Class methods are seperated by a comma
- Class methods get a `this` value that is the struct
``` 
class XY : XY_struct {
    myMethod(): Boolean {

    },
    myOtherMethod: void {

    },
}
```

## Methods 
- Methods are very similar to functions
- The difference is that methods get a `this` value that is the struct

### Operator Overload Functions
- Special functions that define operators
- Need to think a little more about how these work under the hood
```
operator == (byte a, byte b) {
    // check for equality
    return aEQb
}
```


## Asm
- Include assembly in your code
- returns whatever `byte` you leave in the A register
```
return asm {
    LDA n1;
    ADC n2;
};
```

## Null
- Null is a library
- `NullableByte` can be a struct that looks like
```
struct NullableByte {
    bool IsNull,
    byte Value
}
```