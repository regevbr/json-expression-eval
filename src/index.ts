'use strict';

export type PropertyCompareOp<C, K extends keyof C> = C[K];

export type FuncCompareOp<C, F extends FunctionsTable<C>, K extends keyof F> = Parameters<F[K]>[0];

export interface EqualCompareOp<C, K extends keyof C> {
    eq: C[K];
}

export interface NotEqualCompareOp<C, K extends keyof C> {
    neq: C[K];
}

export interface GtCompareOp<C, K extends keyof C> {
    gt: C[K] extends number ? number : never;
}

export interface GteCompareOp<C, K extends keyof C> {
    gte: C[K] extends number ? number : never;
}

export interface LtCompareOp<C, K extends keyof C> {
    lt: C[K] extends number ? number : never;
}

export interface LteCompareOp<C, K extends keyof C> {
    lte: C[K] extends number ? number : never;
}

export type CompareOp<C, F extends FunctionsTable<C>> = {
    [k in keyof C]: PropertyCompareOp<C, k>
    | EqualCompareOp<C, k>
    | NotEqualCompareOp<C, k>
    | GtCompareOp<C, k>
    | GteCompareOp<C, k>
    | LtCompareOp<C, k>
    | LteCompareOp<C, k>
} & {
    [k in keyof F]: FuncCompareOp<C, F, k>
};

export interface AndCompareOp<C, F extends FunctionsTable<C>> {
    and: Array<Expression<C, F>>;
}

export interface OrCompareOp<C, F extends FunctionsTable<C>> {
    or: Array<Expression<C, F>>;
}

export interface NotCompareOp<C, F extends FunctionsTable<C>> {
    not: Expression<C, F>;
}

export type RequireOnlyOne<T, Keys extends keyof T = keyof T> =
    Pick<T, Exclude<keyof T, Keys>>
    & {
    [K in Keys]-?:
    Required<Pick<T, K>>
    & Partial<Record<Exclude<Keys, K>, undefined>>
}[Keys];

export type Expression<C, F extends FunctionsTable<C>> = NotCompareOp<C, F> | OrCompareOp<C, F> | AndCompareOp<C, F> |
    RequireOnlyOne<CompareOp<C, F>>;

export type Func<T> = (param: any, context: T) => boolean;

export interface FunctionsTable<T> {
    [k: string]: Func<T>;
}

export type Context = Record<string, any>;

function isAndCompareOp<C, F extends FunctionsTable<C>>(expression: Expression<C, F>):
    expression is AndCompareOp<C, F> {
    return Array.isArray((expression as AndCompareOp<C, F>).and);
}

function isOrCompareOp<C, F extends FunctionsTable<C>>(expression: Expression<C, F>):
    expression is OrCompareOp<C, F> {
    return Array.isArray((expression as OrCompareOp<C, F>).or);
}

function isNotCompareOp<C, F extends FunctionsTable<C>>(expression: Expression<C, F>):
    expression is NotCompareOp<C, F> {
    return _isObject((expression as NotCompareOp<C, F>).not);
}

function isGtCompareOp<C, F extends FunctionsTable<C>, K extends keyof C>(op: any): op is GtCompareOp<C, K> {
    return op.gt !== undefined;
}

function isGteCompareOp<C, F extends FunctionsTable<C>, K extends keyof C>(op: any): op is GteCompareOp<C, K> {
    return op.gte !== undefined;
}

function isLteCompareOp<C, F extends FunctionsTable<C>, K extends keyof C>(op: any): op is LteCompareOp<C, K> {
    return op.lte !== undefined;
}

function isLtCompareOp<C, F extends FunctionsTable<C>, K extends keyof C>(op: any): op is LtCompareOp<C, K> {
    return op.lt !== undefined;
}

function isEqualCompareOp<C, F extends FunctionsTable<C>, K extends keyof C>(op: any): op is EqualCompareOp<C, K> {
    return op.eq !== undefined;
}

function isNotEqualCompareOp<C, F extends FunctionsTable<C>, K extends keyof C>(op: any):
    op is NotEqualCompareOp<C, K> {
    return op.neq !== undefined;
}

const _isObject = (obj: any) => {
    const type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

const evaluateCompareOp = <C, F extends FunctionsTable<C>, K extends keyof RequireOnlyOne<CompareOp<C, F>>>(
    op: RequireOnlyOne<CompareOp<C, F>>, key: K, param: any): boolean => {
    if (!_isObject(op[key])) {
        return param === op[key];
    }
    const keys = Object.keys(op[key]);
    if (keys.length !== 1) {
        throw new Error('Invalid expression - too may keys');
    }
    if (isGtCompareOp(op[key])) {
        return param > op[key].gt;
    } else if (isGteCompareOp(op[key])) {
        return param >= op[key].gte;
    } else if (isLteCompareOp(op[key])) {
        return param <= op[key].lte;
    } else if (isLtCompareOp(op[key])) {
        return param < op[key].lt;
    } else if (isEqualCompareOp(op[key])) {
        return param === op[key].eq;
    } else if (isNotEqualCompareOp(op[key])) {
        return param !== op[key].neq;
    }
    throw new Error(`Invalid expression - unknown op ${keys[0]}`);
};

const handleAndOp = <C extends Context, F extends FunctionsTable<C>>(andExpression: Array<Expression<C, F>>, context: C,
                                                                     functionsTable: F): boolean => {
    if (andExpression.length === 0) {
        throw new Error('Invalid expression - and operator must have at least one expression');
    }
    let result = true;
    andExpression.forEach((currExpression) => {
        const currResult = evaluate(currExpression, context, functionsTable);
        result = result && currResult;
    });
    return result;
};

const handleOrOp = <C extends Context, F extends FunctionsTable<C>>(orExpression: Array<Expression<C, F>>, context: C,
                                                                    functionsTable: F): boolean => {
    if (orExpression.length === 0) {
        throw new Error('Invalid expression - or operator must have at least one expression');
    }
    let result = false;
    orExpression.forEach((currExpression) => {
        const currResult = evaluate(currExpression, context, functionsTable);
        result = result || currResult;
    });
    return result;
};

export const evaluate = <C extends Context, F extends FunctionsTable<C>>(expression: Expression<C, F>, context: C,
                                                                         functionsTable: F): boolean => {
    const keys = Object.keys(expression);
    if (keys.length !== 1) {
        throw new Error('Invalid expression - too may keys');
    }
    const key = keys[0];
    if (isAndCompareOp(expression)) {
        return handleAndOp(expression.and, context, functionsTable);
    } else if (isOrCompareOp(expression)) {
        return handleOrOp(expression.or, context, functionsTable);
    } else if (isNotCompareOp(expression)) {
        return !evaluate(expression.not, context, functionsTable);
    } else if (key in functionsTable) {
        return functionsTable[key](expression[key], context);
    } else if (key in context) {
        return evaluateCompareOp<C, F, typeof key>(expression, key, context[key]);
    }
    throw new Error(`Invalid expression - unknown function ${key}`);
};
