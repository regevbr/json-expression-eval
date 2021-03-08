/* tslint:disable:array-type */
import {Context, FunctionsTable} from './types';
import {Function, S, List, U} from 'ts-toolbelt';

type GetPartType<V> = V extends string ? 'string' : V extends number ? 'number' : V extends boolean ? 'boolean'
    : V extends Array<infer N> ? GetPartType<N> : never;

interface ExpressionFunctionPart<C extends Context, F extends FunctionsTable<C>, K extends keyof F> {
    type: GetPartType<Function.Parameters<F[K]>[0]>;
    isArray: Function.Parameters<F[K]>[0] extends Array<any> ? true : false;
    propertyPath: K;
    isFunction: true;
}

type ExpressionFunctionParts<C extends Context, F extends FunctionsTable<C>> = {
    [K in keyof F]: ExpressionFunctionPart<C, F, K>
}

interface ExpressionContextPart<C extends Context, K extends keyof C, P extends List.List<string>> {
    type: GetPartType<C[K]>;
    isArray: false;
    propertyPath: S.Join<P, '.'>;
    isFunction: false;
}

type Primitive = string | number | boolean;

type _ExpressionContextParts<C, P extends List.List<string>> = {
    [k in U.Select<keyof C, string>]:
    C[k] extends Primitive ? ExpressionContextPart<C, k, [...P, k]>
        : C[k] extends Array<any> ? never
        : _ExpressionContextParts<C[k], [...P, k]>;
}

type ExpressionContextParts<C extends Context> = _ExpressionContextParts<C, []>;

export type ExpressionParts<C extends Context, F extends FunctionsTable<C>> =
    ExpressionFunctionParts<C, F>
    & ExpressionContextParts<C>;
