import {Object, String, Union} from 'ts-toolbelt';
import {Paths} from './paths';
import {NonNullable} from './required';

export type FuncCompareOp<C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    K extends keyof F, CustomEvaluatorFuncRunOptions> =
    Awaited<Parameters<F[K]>[0]>;

export type StringPaths<O extends object, Ignore> = any extends O ?
    never : (any extends Ignore ? never : String.Join<Paths<O, [], Ignore | any[], string>, '.'>);

export type Primitive = string | number | boolean;

export type PropertyPathsOfType<C extends Context, Ignore, V extends Primitive> = {
    [K in StringPaths<C, Ignore>]:
    Union.NonNullable<Object.Path<C, String.Split<K, '.'>>> extends V ? 1 : 0;
};

export type ExtractPropertyPathsOfType<T extends Record<string, 1 | 0>> = {
    [K in keyof T]: T[K] extends 1 ? K : never
}[keyof T];

export type PropertyRef<C extends Context, Ignore, V extends Primitive> = {
    ref: ExtractPropertyPathsOfType<PropertyPathsOfType<C, Ignore, V>>
}

export type MathOps = '+' | '-' | '*' | '/' | '%' | 'pow';

export interface MathOp<C extends Context, Ignore> {
    op: MathOps;
    rhs: number | PropertyRef<C, Ignore, number>;
    lhs: number | PropertyRef<C, Ignore, number>;
}

export interface EqualCompareOp<C extends Context, Ignore, V extends Primitive> {
    eq: V | PropertyRef<C, Ignore, V> | (V extends number ? MathOp<C, Ignore> : never);
}

export interface NotEqualCompareOp<C extends Context, Ignore, V extends Primitive> {
    neq: V | PropertyRef<C, Ignore, V> | (V extends number ? MathOp<C, Ignore> : never);
}

export interface InqCompareOp<C extends Context, Ignore, V extends Primitive> {
    inq: (V | PropertyRef<C, Ignore, V> | (V extends number ? MathOp<C, Ignore> : never))[];
}

export interface NinCompareOp<C extends Context, Ignore, V extends Primitive> {
    nin: (V | PropertyRef<C, Ignore, V> | (V extends number ? MathOp<C, Ignore> : never))[];
}

export interface BetweenCompareOp<C extends Context, Ignore> {
    between: readonly [
            number | PropertyRef<C, Ignore, number> | MathOp<C, Ignore>,
            number | PropertyRef<C, Ignore, number> | MathOp<C, Ignore>
    ];
}

export interface GtCompareOp<C extends Context, Ignore> {
    gt: number | PropertyRef<C, Ignore, number> | MathOp<C, Ignore>;
}

export interface GteCompareOp<C extends Context, Ignore> {
    gte: number | PropertyRef<C, Ignore, number> | MathOp<C, Ignore>;
}

export interface LtCompareOp<C extends Context, Ignore> {
    lt: number | PropertyRef<C, Ignore, number> | MathOp<C, Ignore>;
}

export interface LteCompareOp<C extends Context, Ignore> {
    lte: number | PropertyRef<C, Ignore, number> | MathOp<C, Ignore>;
}

export interface RegexCompareOp<C extends Context, Ignore> {
    regexp: string | PropertyRef<C, Ignore, string>;
}

export interface RegexiCompareOp<C extends Context, Ignore> {
    regexpi: string | PropertyRef<C, Ignore, string>;
}

export type FuncCompares<C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    CustomEvaluatorFuncRunOptions> = {
    [K in keyof F]: FuncCompareOp<C, F, K, CustomEvaluatorFuncRunOptions>;
}

export type NumberCompareOps<C extends Context, Ignore, V extends Primitive> =
    V extends number ? BetweenCompareOp<C, Ignore> |
        GtCompareOp<C, Ignore> |
        GteCompareOp<C, Ignore> |
        LtCompareOp<C, Ignore> |
        LteCompareOp<C, Ignore> : never;

export type StringCompareOps<C extends Context, Ignore, V extends Primitive> =
    V extends string ? RegexCompareOp<C, Ignore> | RegexiCompareOp<C, Ignore> : never;

export type ExtendedCompareOp<C extends Context, Ignore, V extends Primitive> =
    EqualCompareOp<C, Ignore, V> | NotEqualCompareOp<C, Ignore, V> | InqCompareOp<C, Ignore, V> |
    NinCompareOp<C, Ignore, V> | NumberCompareOps<C, Ignore, V> | StringCompareOps<C, Ignore, V>;

export type PropertyCompareOps<C extends Context, Ignore> = {
    [K in StringPaths<C, Ignore>]:
    Union.NonNullable<Object.Path<C, String.Split<K, '.'>>> extends Primitive ?
        (Object.Path<C, String.Split<K, '.'>> |
            ExtendedCompareOp<C, Ignore, Union.NonNullable<Object.Path<C, String.Split<K, '.'>>>>)
        : never;
};

export interface AndCompareOp<C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    Ignore, CustomEvaluatorFuncRunOptions> {
    and: Expression<C, F, Ignore, CustomEvaluatorFuncRunOptions>[];
}

export interface OrCompareOp<C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    Ignore, CustomEvaluatorFuncRunOptions> {
    or: Expression<C, F, Ignore, CustomEvaluatorFuncRunOptions>[];
}

export interface NotCompareOp<C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    Ignore, CustomEvaluatorFuncRunOptions> {
    not: Expression<C, F, Ignore, CustomEvaluatorFuncRunOptions>;
}

export type RequireOnlyOne<T extends object> = Object.Either<T, keyof T>;

export type FullExpression<C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    Ignore, CustomEvaluatorFuncRunOptions> =
    NotCompareOp<C, F, Ignore, CustomEvaluatorFuncRunOptions> &
    OrCompareOp<C, F, Ignore, CustomEvaluatorFuncRunOptions> &
    AndCompareOp<C, F, Ignore, CustomEvaluatorFuncRunOptions> &
    FuncCompares<C, F, CustomEvaluatorFuncRunOptions> &
    PropertyCompareOps<C, Ignore>;

export type Expression<C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    Ignore, CustomEvaluatorFuncRunOptions> =
    RequireOnlyOne<FullExpression<C, F, Ignore, CustomEvaluatorFuncRunOptions>>;

export type EvaluatorFuncRunOptions<CustomEvaluatorFuncRunOptions = undefined> = {
    custom: CustomEvaluatorFuncRunOptions;
    validation: boolean;
}
export type Func<T, CustomEvaluatorFuncRunOptions> = (
    param: any, context: T, runOptions: EvaluatorFuncRunOptions<CustomEvaluatorFuncRunOptions>) =>
    boolean | Promise<boolean>;

export type FunctionsTable<T, CustomEvaluatorFuncRunOptions> = Record<string, Func<T, CustomEvaluatorFuncRunOptions>>;

export type Context = Record<string, any>;

export type ValidationContext<C extends Context, Ignore = never> = NonNullable<C, Ignore>;
