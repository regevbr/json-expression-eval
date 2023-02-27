/* tslint:disable:array-type */
import {Context, FunctionsTable, Primitive, StringPaths} from './evaluator';
import {Function, String, Object} from 'ts-toolbelt';

type GetPartType<V> = V extends string ? 'string' : V extends number ? 'number' : V extends boolean ? 'boolean'
    : V extends Array<infer N> ? GetPartType<N> : never;

interface ExpressionFunctionPart<C extends Context, F extends FunctionsTable<C, CustomEngineRuleFuncRunOptions>,
    K extends keyof F, CustomEngineRuleFuncRunOptions> {
    type: GetPartType<Function.Parameters<F[K]>[0]>;
    isArray: Function.Parameters<F[K]>[0] extends Array<any> ? true : false;
    propertyPath: K;
    isFunction: true;
}

type ExpressionFunctionParts<C extends Context, F extends FunctionsTable<C, CustomEngineRuleFuncRunOptions>,
    Extra extends object, CustomEngineRuleFuncRunOptions> = {
    [K in keyof F]: ExpressionFunctionPart<C, F, K, CustomEngineRuleFuncRunOptions> & Extra;
}

interface ExpressionContextPart<V, P extends string> {
    type: GetPartType<V>;
    isArray: false;
    propertyPath: P;
    isFunction: false;
}

type ExpressionContextParts<C extends Context, Extra extends object, Ignore> = {
    [K in StringPaths<C, Ignore>]:
    Object.Path<C, String.Split<K, '.'>> extends Primitive
        ? ExpressionContextPart<Object.Path<C, String.Split<K, '.'>>, K> & Extra
        : never;
}

export type ExpressionParts<C extends Context, F extends FunctionsTable<C, CustomEngineRuleFuncRunOptions>,
    Extra extends object, Ignore, CustomEngineRuleFuncRunOptions> =
    ExpressionFunctionParts<C, F, Extra, CustomEngineRuleFuncRunOptions> &
    Object.Filter<ExpressionContextParts<C, Extra, Ignore>, never, 'equals'>;
