# Compile Run Pipeline
## Steps:

### Lexer
- Parses `.g` sourcecode into tokens
- Parses tokens into an Abstract Syntax Tree (AST) of `Expression`s

### Compiler
- Gets `operator` and `struct` definitions from the top level
- Traverses AST and checks identifiers from root -> leaves
- Traverses AST and checks types from leaves -> root
- Traverses AST and converts into `.ga` gassembly

### Assembler
- Parses `.ga`
- Allocates `alloc`s
- Specifies JMP destinations
- Writes 6502 binary as `.gbin`

### Emulator
- Fully-fledged (maybe?) 6502 emulator
- Similar memory map as my real chip:
- 0 - 0x5FFF: RAM
- 0x6000 - 0x7FFF: IO
- 0x8000 - 0xFFFF: ROM <-code starts at 0x8000
- returns A register on `BRK`