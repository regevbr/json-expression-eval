export interface FuncOp {
    [k: string]: any;
}
export interface AndOp {
    and: Expression[];
}
export interface OrOp {
    or: Expression[];
}
export interface NotOp {
    not: Expression;
}
export declare type Expression = FuncOp | AndOp | OrOp | NotOp;
export declare type ExpressionContext = any;
export declare type Func = (param: any, context: ExpressionContext) => boolean;
export declare type FunctionsTable = {
    [k: string]: Func;
};
export declare const evaluate: (expression: Expression, context: any, functionsTable: FunctionsTable) => boolean;
