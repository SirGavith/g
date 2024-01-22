export enum Operators {
    And,
    Or,
    Plus,
    PlusEQ,
    Minus,
    MinusEQ,
    Times,
    TimesEQ,
    Div,
    DivEQ,
    Mod,
    ModEQ,
    Increment,
    Decrement,
    SetEQ,
    IsEqual,
    IsNotEqual,
    Not,
    GreaterThan,
    GreaterThanEQ,
    LessThan,
    LessThanEQ,
    BitshiftR,
    BitshiftL,
}

export const binaries: [string, Operators][] = [
    ['==', Operators.IsEqual],
    ['!=', Operators.IsNotEqual],
    ['&&', Operators.And],
    ['||', Operators.Or],
    ['+', Operators.Plus],
    ['-', Operators.Minus],
    ['*', Operators.Times],
    ['/', Operators.Div],
    ['%', Operators.Mod],
    ['>>', Operators.BitshiftR],
    ['<<', Operators.BitshiftL],
    ['>=', Operators.GreaterThanEQ],
    ['>', Operators.GreaterThan],
    ['<=', Operators.LessThanEQ],
    ['<', Operators.LessThan],
]
export const binaryOperators = new Set(binaries.map(([_, opr]) => opr))

export const binarySets: [string, Operators][] = [
    ['+=', Operators.PlusEQ],
    ['-=', Operators.MinusEQ],
    ['*=', Operators.TimesEQ],
    ['/=', Operators.DivEQ],
    ['%=', Operators.ModEQ],
]
export const setEq: [string, Operators][] = [
    ['=', Operators.SetEQ]
]
export const binarySetOperators = new Set(binarySets.concat(setEq).map(([_, opr]) => opr))

export const unaryPrefixes: [string, Operators][] = [
    ['!', Operators.Not],
]
export const unaryPostfixes: [string, Operators][] = [
    ['++', Operators.Increment],
    ['--', Operators.Decrement],
]

export const operatorMapStringOpr = new Map(unaryPostfixes.concat(binarySets, binaries, setEq, unaryPrefixes))
export const operatorMapOprString = new Map(unaryPostfixes.concat(binarySets, binaries, setEq, unaryPrefixes).map(([a,b]) => [b,a] as const))