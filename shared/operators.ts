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
    SetEquals,
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
    ['+=', Operators.PlusEQ],
    ['+', Operators.Plus],
    ['-=', Operators.MinusEQ],
    ['-', Operators.Minus],
    ['*=', Operators.TimesEQ],
    ['*', Operators.Times],
    ['/=', Operators.DivEQ],
    ['/', Operators.Div],
    ['%=', Operators.ModEQ],
    ['%', Operators.Mod],
    ['=', Operators.SetEquals],
    ['>>', Operators.BitshiftR],
    ['<<', Operators.BitshiftL],
    ['>=', Operators.GreaterThanEQ],
    ['>', Operators.GreaterThan],
    ['<=', Operators.LessThanEQ],
    ['<', Operators.LessThan],
]
export const unaryPrefixes: [string, Operators][] = [
    ['!', Operators.Not],
]
export const unaryPostfixes: [string, Operators][] = [
    ['++', Operators.Increment],
    ['--', Operators.Decrement],
]

export const operatorMapStringOpr = new Map(binaries.concat(unaryPrefixes, unaryPostfixes))
export const operatorMapOprString = new Map(binaries.concat(unaryPrefixes, unaryPostfixes).map(([a,b]) => [b,a] as const))