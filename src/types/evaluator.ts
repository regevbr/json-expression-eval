import {Object, String, Union} from 'ts-toolbelt';
import {Paths} from './paths';
import {NonNullable} from './required';

export type FuncCompareOp<C extends Context, F extends FunctionsTable<C>, K extends keyof F> = Parameters<F[K]>[0];

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

export type FuncCompares<C extends Context, F extends FunctionsTable<C>> = {
    [K in keyof F]: FuncCompareOp<C, F, K>;
}

export type NumberCompareOps<V = any> =
    V extends number ? GtCompareOp | GteCompareOp | LtCompareOp | LteCompareOp : never;

export type ExtendedCompareOp<V = any> = EqualCompareOp<V> | NotEqualCompareOp<V> | NumberCompareOps<V>;

export type StringPaths<O extends object, Ignore> =
    String.Join<Paths<O, [], Ignore | any[], string>, '.'>;

export type Primitive = string | number | boolean;

export type PropertyCompareOps<C extends Context, Ignore> = {
    [K in StringPaths<C, Ignore>]:
    Union.NonNullable<Object.Path<C, String.Split<K, '.'>>> extends Primitive ?
        (Object.Path<C, String.Split<K, '.'>> | ExtendedCompareOp<Object.Path<C, String.Split<K, '.'>>>)
        : never;
};

export interface AndCompareOp<C extends Context, F extends FunctionsTable<C>, Ignore> {
    and: Expression<C, F, Ignore>[];
}

export interface OrCompareOp<C extends Context, F extends FunctionsTable<C>, Ignore> {
    or: Expression<C, F, Ignore>[];
}

export interface NotCompareOp<C extends Context, F extends FunctionsTable<C>, Ignore> {
    not: Expression<C, F, Ignore>;
}

export type RequireOnlyOne<T extends object> = Object.Either<T, keyof T>;

export type FullExpression<C extends Context, F extends FunctionsTable<C>, Ignore> =
    NotCompareOp<C, F, Ignore> &
    OrCompareOp<C, F, Ignore> &
    AndCompareOp<C, F, Ignore> &
    FuncCompares<C, F> &
    PropertyCompareOps<C, Ignore>;

export type Expression<C extends Context, F extends FunctionsTable<C>, Ignore = never> =
    RequireOnlyOne<FullExpression<C, F, Ignore>>;

export type Func<T> = (param: any, context: T) => boolean;

export type FunctionsTable<T> = Record<string, Func<T>>;

export type Context = Record<string, any>;

export type ValidationContext<C extends Context, Ignore> = NonNullable<C, Ignore>;
