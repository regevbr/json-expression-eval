export declare type PropertyCompareOp<C, K extends keyof C> = C[K];
export declare type FuncCompareOp<C, F extends FunctionsTable<C>, K extends keyof F> = Parameters<F[K]>[0];
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
export declare type CompareOp<C, F extends FunctionsTable<C>> = {
    [k in keyof C]: PropertyCompareOp<C, k> | EqualCompareOp<C, k> | NotEqualCompareOp<C, k> | GtCompareOp<C, k> | GteCompareOp<C, k> | LtCompareOp<C, k> | LteCompareOp<C, k>;
} & {
    [k in keyof F]: FuncCompareOp<C, F, k>;
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
export declare type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>;
}[Keys];
export declare type Expression<C, F extends FunctionsTable<C>> = NotCompareOp<C, F> | OrCompareOp<C, F> | AndCompareOp<C, F> | RequireOnlyOne<CompareOp<C, F>>;
export declare type Func<T> = (param: any, context: T) => boolean;
export interface FunctionsTable<T> {
    [k: string]: Func<T>;
}
export declare type Context = Record<string, any>;
export declare const evaluate: <C extends Record<string, any>, F extends FunctionsTable<C>>(expression: Expression<C, F>, context: C, functionsTable: F) => boolean;
