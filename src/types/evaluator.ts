import {Object, String, Any} from 'ts-toolbelt';
import {Paths} from './paths';

export type FuncCompareOp<C, F extends FunctionsTable<C>, K extends keyof F> = Parameters<F[K]>[0];

export interface EqualCompareOp<V> {
    eq: V;
}

export interface NotEqualCompareOp<V> {
    neq: V;
}

export interface GtCompareOp {
    gt: number;
}

export interface GteCompareOp {
    gte: number;
}

export interface LtCompareOp {
    lt: number;
}

export interface LteCompareOp {
    lte: number;
}

export type FuncCompares<C, F extends FunctionsTable<C>> = {
    [K in keyof F]: FuncCompareOp<C, F, K>;
}

export type NumberCompareOps<V = any> =
    V extends number ? GtCompareOp | GteCompareOp | LtCompareOp | LteCompareOp : never;

export type ExtendedCompareOp<V = any> = EqualCompareOp<V> | NotEqualCompareOp<V> | NumberCompareOps<V>;

export type StringPaths<O extends object, Ignore = never> =
    String.Join<Paths<O, [], 'required', Ignore | any[], string>, '.'>;

export type Primitive = string | number | boolean;

export type PropertyCompareOps<C extends Context, Ignore = never> = {
    [K in StringPaths<C, Ignore>]:
    Object.Path<C, String.Split<K, '.'>> extends Primitive ?
        (Object.Path<C, String.Split<K, '.'>> | ExtendedCompareOp<Object.Path<C, String.Split<K, '.'>>>)
        : never;
};

export interface AndCompareOp<C, F extends FunctionsTable<C>, Ignore> {
    and: Expression<C, F, Ignore>[];
}

export interface OrCompareOp<C, F extends FunctionsTable<C>, Ignore> {
    or: Expression<C, F, Ignore>[];
}

export interface NotCompareOp<C, F extends FunctionsTable<C>, Ignore> {
    not: Expression<C, F, Ignore>;
}

export type RequireOnlyOne<T extends object> = Object.Either<T, keyof T>;

export type Expression<C, F extends FunctionsTable<C>, Ignore = never> =
    NotCompareOp<C, F, Ignore> | OrCompareOp<C, F, Ignore> | AndCompareOp<C, F, Ignore> |
    RequireOnlyOne<FuncCompares<C, F>> | RequireOnlyOne<PropertyCompareOps<C, Ignore>>;

export type Func<T> = (param: any, context: T) => boolean;

export interface FunctionsTable<T> {
    [k: string]: Func<T>;
}

export type Context = Record<string, any>;

export type RequiredDeep<O> = {
    [K in keyof O]-?: O[K] extends Primitive ? O[K] : RequiredDeep<O[K]>;
}

export type ValidationContext<C extends Context> = Object.NonNullable<C, Any.Key, 'deep'>;