import { DeclarationExpression, Variable } from "../shared/expressions/DeclarationExpression";
import { Expression, ExpressionTypes } from "../shared/expressions/Expressions";
import { FuncExpression } from "../shared/expressions/FuncExpression";
import { StructExpression } from "../shared/expressions/StructExpression";
import * as Console from 'glib/dist/Console'
import { VariableExpression } from "../shared/expressions/VariableExpression";
import { CustomError } from "glib/dist/Error";
import { OperatorOverloadExpression } from "../shared/expressions/OperatorOverloadExpression";
import { randomBytes } from "crypto";
import { stackAssembly } from './stack'
import { OperationExpression } from "../shared/expressions/OperationExpression";
import { Operators } from "../shared/operators";

export class CompilerError extends CustomError {
    constructor(...message: any[]) {
        super(message)
        this.name = this.constructor.name
    }
}

const arbIdentifier = 0x1234
export function nextArbitraryIdentifier(): string {
    return `R` + arbIdentifier.toString(16)
}

//to 6502 gassembly
export function Compile(expression: Expression, inFileDir: string, debug: boolean = false) {
    if (debug) expression.Log()

    const validOperators = new Map<string, OperatorOverloadExpression>()

    // const structs: StructExpression[] = []

    const validTypes = new Map<string, { Size: number }>()
    validTypes.set('byte', { Size: 1 })

    expression.Children = expression.Children.filter(childExpr => {
        if (childExpr.ExpressionType === ExpressionTypes.Struct) {
            const struct = childExpr as StructExpression
            validTypes.set(struct.Identifier, { Size: struct.getSize(validTypes) })
            return false
        }
        else if (childExpr.ExpressionType === ExpressionTypes.OperatorOverload) {
            const operatorOverload = childExpr as OperatorOverloadExpression
            validOperators.set(operatorOverload.getHashString(), operatorOverload)
            return false
        }

        return true
    })

    // console.log('valid types:', validTypes)
    // console.log('valid Operators', validOperators)

    const body = expression.traverse({
        Types: validTypes,
        Variables: new Map,
        NextVariableLocation: 2,
        Functions: new Map,
        OperatorOverloads: validOperators,
    })

    return [
        `JSR init_stack\n`,
        `//Your code starts here:`,
        ...body.Assembly,
        `BRK\n\n`,
        //TODO: fix operators
        // ...validOperators.toArray().flatMap(([_, op]) => op.getAssembly(new Map)),
        ...stackAssembly
    ]
}

export interface recursionBody {
    Types: Map<string, { Size: number }>

    Variables: Map<string, Variable>
    NextVariableLocation: number
    
    Functions: Map<string, FuncExpression>
    OperatorOverloads: Map<string, OperatorOverloadExpression>
}

export interface recursionReturn {
    Assembly: string[]
    ReturnType: string
}

// identifiers <name, type>
// vars, functions, 
function traverse (exp: Expression, identifiers: Map<string, Expression>, validTypes: Map<string, number>, validOperators: Map<string, OperatorOverloadExpression>) {
    // hoist structs  

    // if (exp.ExpressionType === ExpressionTypes.Compound) {
    //     exp.Children.sort((a, b) => {
    //         if (a.ExpressionType === ExpressionTypes.Struct) return 1
    //         return 0
    //     })
    // }

    // exp.Log()
    // console.log(identifiers)

    exp.Children.forEach(child => {
        // console.log(`${Console.Cyan + ExpressionTypes[child.ExpressionType] + Console.Reset}`, identifiers)
        //upstream

        const childIdentifiers = identifiers.Copy()

        if (child.ExpressionType === ExpressionTypes.Declaration) {
            const decl = (child as DeclarationExpression)
            identifiers.set(decl.Identifier, decl)
        }
        else if (child.ExpressionType === ExpressionTypes.Func) {
            const func = (child as FuncExpression)
            identifiers.set(func.Identifier, func)
            func.Parameters.forEach(param => {
                childIdentifiers.set(param.Identifier, param)
                param.Size = validTypes.get(param.Type)
            })
        }
        else if (child.ExpressionType === ExpressionTypes.Variable) {
            const vari = (child as VariableExpression)
            if (!identifiers.has(vari.Identifier))
                throw new CompilerError(`Identifier ${vari.Identifier} is not in scope or undeclared`)
        }
        else if (child.ExpressionType === ExpressionTypes.Operation &&
            (child as OperationExpression).Operator === Operators.Accessor) {
                //accessor operator



                return
            }
        
        traverse(child, childIdentifiers, validTypes, validOperators)

    })
    //downstream

    return exp.getType(identifiers, validOperators)
} 