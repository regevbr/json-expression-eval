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
