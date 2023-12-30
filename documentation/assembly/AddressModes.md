# Address modes
|         | Mode                | Syntax    | Operand                                                 | Bytes |
| ---     | ---                 | ---       | ---                                                     | ---   |
| `A`     |	Accumulator	        | -         | implied                                                 | 1     |
| `abs`   |	absolute	        | `$HHLL`   | byte at `$HHLL`                                         | 3     |
| `abs,X` |	absolute, X-indexed	| `$HHLL,X` | `address + X` with carry *                              | 3     |
| `abs,Y` |	absolute, Y-indexed	| `$HHLL,Y` | `address + Y` with carry *                              | 3     |
| `#`     |	immediate	        | `#$BB`    | byte `BB`                                               | 2     |
| `impl`  |	implied	            | -	        | operand implied                                         | 1     |
| `ind`   |	indirect	        | `($HHLL)` | contents of word at address `$HHLL`                     | 3     |
| `X,ind` |	X-indexed, indirect	| `($LL,X)` | Go to zpage word `$LL + X`; return byte at `address` ** | 2     |
| `ind,Y` |	indirect, Y-indexed	| `($LL),Y` | Go to zpage word `$LL`; return byte at `address + Y` *  | 2     |
| `rel`   |	relative	        | `$BB`     | branch target is `PC + signed offset BB` ***            | 2     |
| `zpg`   |	zeropage	        | `$LL`     | zeropage address address = `$00LL`)                     | 2     |
| `zpg,X` |	zeropage, X-indexed	| `$LL,X`   | `address + X` **                                        | 2     |
| `zpg,Y` |	zeropage, Y-indexed	| `$LL,Y`   | `address + Y` **                                        | 2     |

- `*`
  Absolute increments use carry, and crossing the page boundary results in an extra cycle
- `**`
  Zpage increments are without carry, so will wrap around the zpage
- `***`
  Branch offsets are signed 8-bit values, -128 ... +127, negative offsets in two's complement.
  Page transitions may occur and add an extra cycle to the exucution.