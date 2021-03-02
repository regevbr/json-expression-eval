'use strict';

import {O as tObject} from 'ts-toolbelt';

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

export type FuncCompares<C, F extends FunctionsTable<C>> = {
    [K in keyof F]: FuncCompareOp<C, F, K>;
}

export type ExtendedCompareOp<C, K extends keyof C> = EqualCompareOp<C, K>
    | NotEqualCompareOp<C, K>
    | GtCompareOp<C, K>
    | GteCompareOp<C, K>
    | LtCompareOp<C, K>
    | LteCompareOp<C, K>;

export type PropertyCompareOp<C> = {
    [K in keyof C]: C[K] extends string | number | boolean ?
        (C[K] | ExtendedCompareOp<C, K>) : RequireOnlyOne<PropertyCompareOp<C[K]>>;
};

export type CompareOp<C, F extends FunctionsTable<C>> = PropertyCompareOp<C> & FuncCompares<C, F>;

export interface AndCompareOp<C, F extends FunctionsTable<C>> {
    and: Expression<C, F>[];
}

export interface OrCompareOp<C, F extends FunctionsTable<C>> {
    or: Expression<C, F>[];
}

export interface NotCompareOp<C, F extends FunctionsTable<C>> {
    not: Expression<C, F>;
}

export type RequireOnlyOne<T extends object> = tObject.Either<T, keyof T>;

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
    const value = op[key];
    if (!_isObject(value)) {
        return param === value;
    }
    const keys = Object.keys(value);
    if (keys.length !== 1) {
        throw new Error('Invalid expression - too may keys');
    }
    const valueKey = keys[0];
    if (isGtCompareOp(value)) {
        return param > value.gt;
    } else if (isGteCompareOp(value)) {
        return param >= value.gte;
    } else if (isLteCompareOp(value)) {
        return param <= value.lte;
    } else if (isLtCompareOp(value)) {
        return param < value.lt;
    } else if (isEqualCompareOp(value)) {
        return param === value.eq;
    } else if (isNotEqualCompareOp(value)) {
        return param !== value.neq;
    } else if (_isObject(param) && valueKey in param) {
        return evaluateCompareOp(value, valueKey, param[valueKey]);
    }
    throw new Error(`Invalid expression - unknown op ${valueKey}`);
};

const handleAndOp = <C extends Context, F extends FunctionsTable<C>>(andExpression: Expression<C, F>[], context: C,
                                                                     functionsTable: F): boolean => {
    if (andExpression.length === 0) {
        throw new Error('Invalid expression - and operator must have at least one expression');
    }
    for (const currExpression of andExpression) {
        if (!evaluate(currExpression, context, functionsTable)) {
            return false
        }
    }
    return true;
};

const handleOrOp = <C extends Context, F extends FunctionsTable<C>>(orExpression: Expression<C, F>[], context: C,
                                                                    functionsTable: F): boolean => {
    if (orExpression.length === 0) {
        throw new Error('Invalid expression - or operator must have at least one expression');
    }
    for (const currExpression of orExpression) {
        if (evaluate(currExpression, context, functionsTable)) {
            return true
        }
    }
    return false;
};

export const evaluate = <C extends Context, F extends FunctionsTable<C>>(expression: Expression<C, F>, context: C,
                                                                         functionsTable: F): boolean => {
    const keys = Object.keys(expression);
    if (keys.length !== 1) {
        throw new Error('Invalid expression - too may keys');
    }
    const key = keys[0];
    if (isAndCompareOp<C, F>(expression)) {
        return handleAndOp(expression.and, context, functionsTable);
    } else if (isOrCompareOp<C, F>(expression)) {
        return handleOrOp(expression.or, context, functionsTable);
    } else if (isNotCompareOp<C, F>(expression)) {
        return !evaluate(expression.not, context, functionsTable);
    } else if (key in functionsTable) {
        return functionsTable[key](expression[key], context);
    } else if (key in context) {
        return evaluateCompareOp<C, F, typeof key>(expression, key, context[key]);
    }
    throw new Error(`Invalid expression - unknown function ${key}`);
};
