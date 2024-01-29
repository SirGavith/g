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