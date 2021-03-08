/* tslint:disable:array-type */
import {Context, FunctionsTable} from './types';
import {O, Function} from 'ts-toolbelt';

export type GetPartType<V> = V extends string ? 'string' : V extends number ? 'number' : V extends boolean ? 'boolean'
    : V extends Array<infer N> ? GetPartType<N> : never;

type v = GetPartType<Function.Parameters<(s: string[]) => boolean>[0]>;

export interface ExpressionFunctionPart<C extends Context, F extends FunctionsTable<C>, K extends keyof F> {
    type: GetPartType<Function.Parameters<F[K]>[0]>;
    isArray: Function.Parameters<F[K]>[0] extends Array<any> ? true : false;
    propertyPath: K;
    isFunction: true;
}

export type ExpressionFunctionParts<C extends Context, F extends FunctionsTable<C>> = {
    [K in keyof F]: ExpressionFunctionPart<C, F, K>
}

export interface ExpressionContextPart<C extends Context, K extends keyof C> {
    type: GetPartType<C[K]>;
    isArray: false;
    propertyPath: K;
    isFunction: false;
}

export type Primitive = string | number | boolean;

export type _ExpressionContextParts<C, K extends keyof C> = {
    [k in K]: C[k] extends Primitive ? ExpressionContextPart<C, k> : never;
}

export type ExpressionContextParts<C extends Context> = _ExpressionContextParts<C, O.SelectKeys<C, Primitive>>;

export type ExpressionParts<C extends Context, F extends FunctionsTable<C>> =
    ExpressionFunctionParts<C, F>
    & ExpressionContextParts<C>;

