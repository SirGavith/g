import fs from 'fs'
import * as Console from 'glib/dist/Console'
import { Extensions } from 'glib'
import { Lexer, } from '../lexer/lexer'
import { Emu6502 } from '../emulator/emulator'
import { Assemble } from '../assembler/assembler'
import { Compile } from '../compiler/compiler'
import path from 'path'
Extensions.init()


class UnitTest {
    constructor(public Name: string, public gFile: string, public ExpectedResult: number) { }
    
    Run() {
        const filePath = path.join(testsDir, this.gFile)

        const loadStartTime = process.hrtime();

        console.log(Console.Cyan + 'Processing', Console.Reset, filePath.split('/').slice(-1)[0])

        // Read Code
        let code = fs.readFileSync(filePath, 'utf8').replaceAll('\r', '')

        // Lex Code
        const AST = Lexer(code, testsDir)

        const lexTime = process.hrtime(loadStartTime)
        console.log(Console.Cyan + `Lexed ${code.split('\n').length} lines in ${lexTime[0]}s ${lexTime[1] / 10 ** 6}ms` + Console.Reset)
        const compStartTime = process.hrtime();


        // Compile AST
        const assembly = Compile(AST, testsDir).join('\n')

        // Write assembly

        const compTime = process.hrtime(compStartTime)
        console.log(Console.Cyan + `Compiled in ${compTime[0]}s ${compTime[1] / 10 ** 6}ms`)
        const assmStartTime = process.hrtime();

        // Assemble File
        const [ROM, codeLength] = Assemble(assembly, testsDir)

        const assmTime = process.hrtime(assmStartTime)
        console.log(Console.Cyan + `Assembled ${codeLength} bytes in ${assmTime[0]}s ${assmTime[1] / 10 ** 6}ms.`, Console.Reset)

        // Load Emulator
        const cpu = new Emu6502()
        cpu.Debug = false
        cpu.Storage = new Uint8Array(0x10000)
        ROM.copy(cpu.Storage, 0x8000)

        const runStartTime = process.hrtime();

        // Execute program
        const exitCode = cpu.Execute()

        const runTime = process.hrtime(runStartTime)
        console.log(Console.Cyan + `Exited with code ${exitCode}` + Console.Reset)
        console.log(Console.Cyan + `Executed in ${runTime[0]}s ${runTime[1] / 10 ** 6}ms` + Console.Reset)

        if (exitCode === this.ExpectedResult) {
            console.log(Console.Green + `Test ${this.Name} passed`, Console.Reset)
            return true
        }
        console.log(Console.Red + `Test ${this.Name} failed`, Console.Reset)
        return true
    }
}


const testsDir = './projects/tests'
const tests: UnitTest[] = [
    new UnitTest('byte equality', './byteEquality.g', 1),
    new UnitTest('byte additon', './byteAddition.g', 1),
    new UnitTest('byte arithmetic', './byteArithmetic.g', 1),
    // new UnitTest('increment', './byteIncrement.g', 1),
    new UnitTest('while loop', './loop.g', 1),
]

const passingTests = tests.filter(test => test.Run()).length
console.log(Console.Magenta + `${passingTests} / ${tests.length} tests passed` + Console.Reset)