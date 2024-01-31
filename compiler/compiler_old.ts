// import { Word, instructionsMU0 } from './Emulator'
import { Expression, ExpressionTypes, Lexer, OperationExpression, Operators, VariableExpression } from './Lexer';
import { CustomError } from 'glib/dist/Error'


export class CompilerError extends CustomError { constructor(...message: any[]) { super(message); this.name = this.constructor.name} }

function PreAssemble(c: string) {
    const code = c.split('/n').filter(l => l.RegexTest(/\s*/)).map(l => l.trim())
    //generate assembly for assembly lines
    
    const assembly = code.filter(line => line.split(' ').some(s => instructionsMU0.includes(s))),
        allocs = code.filter(line => line.startsWith('alloc'))
    //allocate memory words for all allocs
    //set those memory vals to initializer values
    //replace all assembly refrences of alloc with the mem location
    allocs.forEach(a => {
        const [identifier, initializer, initialValue] = a.split(' ').slice(1)
        if (!identifier) throw new CompilerError('An identifier must be present')

        const memAddress = assembly.push(initialValue ?? 0x0000) - 1
        assembly.forEach((line, i) => {
            if (line.includes(identifier)) {
                assembly[i] = line.replaceAll(identifier, memAddress.toString(16))
            }
        })
    })

    //replace all assembly refrences of locations with the mem location
    assembly.forEach((line, memAddress) => {
        if (line.startsWith('@')) {
            const identifier = line.split(' ')[0].slice(1)
            if (!identifier) throw new CompilerError('An identifier must be present')

            assembly.forEach((line, i) => {
                if (i === memAddress) return
                if (line.includes(identifier)) {
                    assembly[i] = line.replaceAll(identifier, memAddress.toString(16))
                }
            })
            assembly[memAddress] = line.replace('@'+identifier, '').trim()
        }
    })

    return assembly
}

function Assemble(assembly: string[]) {
    //to bytecode
    const bytecode: Word[] = assembly.map(line => {
        const spl = line.split(' ')
        if ((spl.length === 2 || spl.length === 1) && instructionsMU0.includes(spl[0])) {
            //instruction statement
            const instr = (instructionsMU0.indexOf(spl[0]) << 12) | (spl[1]?.toInt() ?? 0)

            return new Word(16, instr)
        }
        else if (spl.length === 1) {
            //literal
            return new Word(16, spl[0].toInt())
        }
        else throw new Error(`Could not understand line '${line}'`)
    })
    bytecode.map(w => w.toString())
    return bytecode
}

// const assembly = PreAssemble(`
//     alloc var1 = 0x4
//     alloc var2 = 0x1

//     @start LDA var1
//     SUB var2
//     STO var1
//     LDA var1
//     JNE start
//     STP
// `)

// const bytecode = Assemble(assembly)

// console.log(assembly.join('\n'))


// console.log(bytecode)
// Execute(bytecode);


/**

let: v1 = 4
let: v2 = 1

@start {
    @start var1 -= var2
}

let:a=4,b=1
if(a>b){a++;}else{a--;}
b+=a
while(b>0){b--;}

declaration:
    identifiers: a, b
    initializers: a: 4, b: 1
conditional:
    condition: a>b
        operation:
            operation: greaterThan
            operand: a
            aperand2: b
    body:
        operation:
            operation: increment
            operand: a
    else:
        operation:
            operation: decrement
            operand: a
operation:
    operation: plusEQ
    operand: b
    operand2: a
while:
    condition: b>0
        operation:
            operation: greaterThan
            operand: b
            operand2: 0
    body:
        operation:
            operation: decrement
            operand: b

**/

export function CompilerMU1(exp: Expression): string[/** assembly */] { 
    //branch to top of tree
    const rand = () => (Math.random() * (10**5)).Floor()
    switch (exp.Type) {
        case ExpressionTypes.Compound: {
            return exp.Expressions.flatMap(e => CompilerMU1(e))
        }
        case ExpressionTypes.Declaration: {
            if (!exp.Identifiers) throw new CompilerError('Declaration expression', exp, 'requires identifiers')
            return exp.Identifiers.flatMap(id => {
                if (exp.Initializers[id]) {
                    return [`alloc ${id}`, CompilerMU1(exp.Initializers[id]), `STA ${id}`].flat()
                }
                return [`alloc ${id}`]
            })
        }
        case ExpressionTypes.If: {
            if (!exp.Condition) throw new CompilerError('If expression', exp, 'requires a condition')
            if (!exp.Body) throw new CompilerError('If expression', exp, 'requires a body')
            const endJump = 'endJump' + rand()
            const bodyJump = 'bodyJump' + rand()
            return [CompilerMU1(exp.Condition), 
                `JNZ ${bodyJump}`,
                exp.ElseExpression ? CompilerMU1(exp.ElseExpression) : [],
                `JMP ${endJump}`,
                `@${bodyJump}`,
                CompilerMU1(exp.Body),
                `@${endJump}`].flat()
        }
        case ExpressionTypes.Literal: {
            if (! exp.Value) throw new CompilerError('Literal expression', exp, 'requires a value')
            return [`LDA #${exp.Value}`]
        }
        case ExpressionTypes.Operation: {
            // Leave result in A reg
            const leftTemp = 'leftTemp' + rand()
            const rightTemp = 'rightTemp' + rand()
            switch (exp.Operator) {
                case Operators.And: {
                    //Logical
                    // return
                    break
                }
                case Operators.Decrement: {
                    if (!exp.Operand) throw new CompilerError('Decrement expression', exp, 'requires an operand')
                    return [CompilerMU1(exp.Operand), `alloc ${rightTemp}`, `STA ${rightTemp}`,
                            `LDA 0x1`, `SUB ${rightTemp}`].flat()
                }
                case Operators.Div: {
                    throw new CompilerError('Division expressions are not currently implemented')
                }
                case Operators.DivEQ: {
                    throw new CompilerError('Division expressions are not currently implemented')
                }
                case Operators.GreaterThan: {
                    // return
                    break
                }
                case Operators.GreaterThanEQ: {
                    // return
                    break
                }
                case Operators.Increment: {
                    if (!exp.Operand || exp.Operand.Type !== ExpressionTypes.Variable) throw new CompilerError('Increment expression', exp, 'requires a variable operand')
                    return [CompilerMU1(exp.Operand), `alloc ${rightTemp}`, `STA ${rightTemp}`,
                            `LDL 0x1`, `ADC ${rightTemp}`].flat()
                }
                case Operators.IsEqual: {
                    // return
                    break
                }
                case Operators.IsNotEqual: {
                    // return
                    break
                }
                case Operators.LessThan: {
                    // return
                    break
                }
                case Operators.LessThanEQ: {
                    // return
                    break
                }
                case Operators.Minus: {
                    if (!exp.Operand || !exp.Operand2) throw new CompilerError('Subtraction expression', exp, 'requires two operands')
                    return [CompilerMU1(exp.Operand2), `alloc ${rightTemp}`, `STA ${rightTemp}`,
                            CompilerMU1(exp.Operand), `SUB ${rightTemp}`].flat()
                }
                case Operators.MinusEQ: {
                    if (!exp.Operand || !exp.Operand2) throw new CompilerError('Subtraction expression', exp, 'requires two operands')
                    if (exp.Operand?.Type !== ExpressionTypes.Variable || !exp.Operand.Identifier) throw new CompilerError('Subtraction expression', exp, 'requires the operand two be a variable')

                    return [CompilerMU1(exp.Operand2), `alloc ${rightTemp}`, `STA ${rightTemp}`,
                            CompilerMU1(exp.Operand), `SBC ${rightTemp}`, `STA ${exp.Operand.Identifier}`].flat()
                }
                case Operators.Mod: {
                    throw new CompilerError('Mod expressions are not currently implemented')
                }
                case Operators.ModEQ: {
                    throw new CompilerError('Mod expressions are not currently implemented')
                }
                case Operators.Not: {
                    //Logical
                    throw new CompilerError('Not expressions are not currently implemented')
                }
                case Operators.Or: {
                    //Logical
                    throw new CompilerError('Or expressions are not currently implemented')
                }
                case Operators.Plus: {
                    if (!exp.Operand || !exp.Operand2) throw new CompilerError('Addition expression', exp, 'requires two operands')
                    return [CompilerMU1(exp.Operand2), `alloc ${rightTemp}`, `STA ${rightTemp}`,
                            CompilerMU1(exp.Operand), `ADC ${rightTemp}`].flat()
                }
                case Operators.PlusEQ: {
                    if (!exp.Operand || !exp.Operand2) throw new CompilerError('Addition expression', exp, 'requires two operands')
                    if (exp.Operand?.Type !== ExpressionTypes.Variable || !exp.Operand.Identifier) throw new CompilerError('Addition expression', exp, 'requires the operand two be a variable')

                    return [CompilerMU1(exp.Operand2), `ADC ${exp.Operand.Identifier}`, `STA ${exp.Operand.Identifier}`].flat()
                }
                case Operators.SetEquals: {
                    if (!exp.Operand || !exp.Operand2) throw new CompilerError('Set Equals expression', exp, 'requires two operands')
                    if (exp.Operand?.Type !== ExpressionTypes.Variable || !exp.Operand.Identifier) throw new CompilerError('Set Equals expression', exp, 'requires the operand two be a variable')
                    
                    return [CompilerMU1(exp.Operand2), `STA ${exp.Operand.Identifier}`].flat()
                }
                case Operators.Times: {
                    throw new CompilerError('Multiplication expressions are not currently implemented')
                }
                case Operators.TimesEQ: {
                    throw new CompilerError('Multiplication expressions are not currently implemented')
                }
                default: {
                    throw new CompilerError('Unknown Operator', exp.Operator)
                }
            }
            break
        }
        case ExpressionTypes.Variable: {
            if (!exp.Identifier) throw new CompilerError('Variable expression', exp, 'requires an identifier')
            return [`LDA ${exp.Identifier}`]
        }
        case ExpressionTypes.While: {
            if (!exp.Condition) throw new CompilerError('If expression', exp, 'requires a condition')
            if (!exp.Body) throw new CompilerError('If expression', exp, 'requires a body')
            const conditionJump = 'conditionJump' + rand()
            const bodyJump = 'bodyJump' + rand()
            const endJump = 'endJump' + rand()
            return [`@${conditionJump}`,
                CompilerMU1(exp.Condition), 
                `JNZ ${bodyJump}`,
                `JMP ${endJump}`,
                `@${bodyJump}`,
                CompilerMU1(exp.Body),
                `@${endJump}`].flat()
        }
    }
    throw new CompilerError('unknown expression', exp)
}

// const c = Lexer(`
// let: a = 4,
//     b = 1;
// if (a > b) {
//     a++;
// }
// else {
//     a--;
// };
// b += a;
// while (b > 0) {
//     b--;
// };
// `)

// const c = Lexer(`
// let: x;
// (x + 2) * (3-5)`)




// const e = new Emu6502
// e.LoadROMfromAssembly(CompilerMU1(c).Log())

// e.Debug = true

// e.Execute()
