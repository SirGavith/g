import { Expression, ExpressionTypes } from "./Expressions"
import { LexerError, isValidIdentifier, parseExpr } from "../../lexer/lexer"
import { Operators, binarySetOperators, operatorMapOprString, operatorMapStringOpr } from "../operators"
import * as Console from 'glib/dist/Console'
import { CompilerError } from "../../compiler/compiler"

export interface FuncParameter {
    Type: string
    Identifier: string
    AssemblyName?: string
}

export class OperatorOverloadExpression extends Expression {
    override ExpressionType: ExpressionTypes.OperatorOverload = ExpressionTypes.OperatorOverload

    ReturnType: string
    Operator: Operators
    Parameters: FuncParameter[] = []
    AssemblyName: string
    Body: Expression

    constructor(rest?: string) {
        super()
        if (rest === undefined) 
            throw new LexerError('could not find func body')

        const operandEndIndex = Math.min(rest.indexOf(' '), rest.indexOf('('))

        const operator = operatorMapStringOpr.get(rest.slice(0, operandEndIndex).trim())
        if (operator === undefined)
            throw new LexerError(`operator overload '${rest.slice(0, operandEndIndex)}' is not valid`)

        this.Operator = operator

        rest = rest.slice(operandEndIndex + 1).trim()

        const lParenIndex = rest.indexOf('(')

        this.ReturnType = rest.slice(0, lParenIndex).trim()

        if (!isValidIdentifier(this.ReturnType)) {
            throw new LexerError(`return type '${this.ReturnType}' is invalid`)
        }

        rest = rest.slice(lParenIndex + 1).trim()

        const rightParenIndex = rest.indexOf(')')

        rest.slice(0, rightParenIndex).trim().split(',').forEach(pair => {
            if (!pair) return
            const [type, identifier] = pair.trim().split(' ')

            if (!isValidIdentifier(type)) {
                throw new LexerError(`type '${type}' is invalid`)
            }
            if (!isValidIdentifier(identifier)) {
                throw new LexerError(`type '${identifier}' is invalid`)
            }
            this.Parameters.push({
                Type: type,
                Identifier: identifier,
                AssemblyName: undefined
            })
        })
        if (binarySetOperators.has(this.Operator)) {
            if (this.Parameters.length !== 2)
                throw new CompilerError('binary Set overloads must have 2 parameters')
        }
        //TODO: add more of those ^ checks for all the other kinds of operator

        if (this.Parameters.length === 0 || this.Parameters.length > 2)
            throw new CompilerError('operator overloads must have 1 or 2 params')

        this.AssemblyName = `OPR_` + this.Parameters.map(p => p.Type).join('_') + '_' + this.Operator
        this.Parameters.forEach(p => p.AssemblyName = `${this.AssemblyName }_${p.Identifier}`)
        rest = rest.slice(rightParenIndex + 1).trim()

        this.Body = parseExpr(rest)
        this.Children.push(this.Body)
    }

    override Log(indent = 0) {
        console.log(' '.repeat(indent) + `${Console.Cyan + ExpressionTypes[this.ExpressionType] + Console.Reset} ${operatorMapOprString.get(this.Operator)} ${Console.Magenta + this.ReturnType + Console.Reset} :`)
        console.log(' '.repeat(indent) + this.Parameters.map(p =>
            `${Console.Red + p.Identifier} ${Console.Magenta + p.Type + Console.Reset}`
        ).join(', '))
        this.Body.Log(indent + 1)
    }

    getHashString() {
        return `${this.Operator};${this.Parameters.map(p => p.Type).join(',')}`
    }

    override getType(identifiers: Map<string, string>): string {
        throw new CompilerError('tried to get type of operator overload')
    }

    override getAssembly(variableFrameLocationMap: Map<string, number>): string[] {
        const varMap = variableFrameLocationMap.Copy()
        this.Parameters.forEach(p => {
            varMap.set(p.Identifier, p.AssemblyName!)
        })

        if (this.Parameters.length === 1) {
            return [
                `alloc ${this.Parameters[0].AssemblyName}`,
                `// operator ${operatorMapOprString.get(this.Operator)} ${this.Parameters.map(p => p.Type).join(' ')}`,
                `@${this.AssemblyName}`,
            ].concat(this.Body.getAssembly(varMap), '')
        }
        else {
            return [
                `alloc ${this.Parameters[0].AssemblyName}`,
                `alloc ${this.Parameters[1].AssemblyName}`,
                `// operator ${operatorMapOprString.get(this.Operator)} ${this.Parameters.map(p => p.Type).join(' ') }`,
                `@${this.AssemblyName}`,
            ].concat(this.Body.getAssembly(varMap), '')
        }
    }
}
