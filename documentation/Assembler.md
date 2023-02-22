
# Assembler v1.3

## Spec
- Each instruction on a new line
- `alloc` allocates a byte
    - Use `alloc` to automatically define variable positions (beginning at $0200)
    - `alloc` has two modes
    - Automatic allocation mode:
      - Use `alloc a` to alloc variable `a`
      - Use `alloc a[2]` to allocate two bytes to variable `a`
        - `a` points to the first byte, use indexed addressing to access the others
    - Manual allocation mode:
      - Use `alloc a: $00` to allocate a variable on the zpage
      - Use `alloc a[10]: $0C` to allocate 10 bytes on the zpage starting at address `$0C`
      - Memory from several allocs may not overlap
    - Using `a` looks like `LDA a`
    - To immediate the address of an alloc, use `LDA #a:LO` or `LDA #a:HI`
- `define` defines an identifier with the number value
    - Use define to define immidiate constants in the code
    - Syntax is `define b: 2` to define `b` to the value `2`
    - Using `b` looks like `STA b` but works like `STA #b`
- `load` loads a file (relative to the .ga file) into rom
  - Syntax is `load './file.txt' into myData along myDatalen`
  - Data is loaded starting at `$A000`, which is `alloc`d as `myData`
  - `myDatalen` is an array of 2: the LO byte followed by the HI byte
  - Can only be used once in an assembly
- `@labels` are for jumping and branching to
    - Syntax is `@myLabel`
    - Jumping to the label looks like `JMP myLabel`
- Identifiers must start with a word character, and may contain `-` and digits after that
- Comments are after `//`, they will be ignored
- Other lines are all the instructions found at [this link](masswerk.at/6502/6502_instruction_set.html)

### Versions
- [x] v1.0: Variable allocation, definitions, and labels; basic workings
- [x] v1.1: Basic array allocation
- [x] v1.2: Data loading, alloc safety
- [x] v1.3: Alloc immediate address querying
- [x] v1.4: Index variables vy literal in assembly; `LDA my_var,1`

### Numbers
  - Hex is preceded by a `$`
  - Binary is preceded by a `%`
  - Decimal is written plain

## Memory Layout
- There are 256 total 'pages' of address space
- My computer has 96 'pages' of RAM, 32 for IO, and 128 for ROM.
  - `$0000` - `$00FF`: User-defined variables (zpage is manual-only at this time, but has one cycle faster reads and writes; 256 bytes)
  - `$0100` - `$01FF`: Stack (processor-managed; 256 bytes; 128 depth)
  - `$0200` - `$5FFF`: Variables (24k bytes)
  - `$6000` - `$7FFF`: Output (manual-only)
  - `$8000` - `$9FFF`: Code (8k bytes)
  - `$A000` - `$FEFF`: Data (24k bytes)
  - `$FF00` - `$FFFF`: Vectors (manual-only, final six bytes are machine-used)

## Under the Hood
- Load data, allocate the data and length
- Create mapping for allocated variables and their positions; start at $0200
- Create mapping for defines
- Create list of labels
- Ensure no duplicate identifiers
- Code starts at $8000
  - determine and fill in opcode
  - determine length. 
    - If its a label, I know the length: branches: 2, jumps: 3
  - fill in operand unless its a label. 
    - in that case, I already know the length: keep this reference around
- Apply label mappings
- remember to consider things like LDA a,X for allocs and defines