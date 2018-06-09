export interface FuncOp {
    [k: string]: any;
}
export interface GtOp {
    [k: string]: {
        gt: any;
    };
}
export interface GteOp {
    [k: string]: {
        gte: any;
    };
}
export interface LtOp {
    [k: string]: {
        lt: any;
    };
}
export interface LteOp {
    [k: string]: {
        lte: any;
    };
}
export interface EqOp {
    [k: string]: {
        eq: any;
    };
}
export interface ShortEqOp {
    [k: string]: any;
}
export interface NeqOp {
    [k: string]: {
        neq: any;
    };
}
export declare type CompareOp = GtOp | GteOp | LtOp | LteOp | EqOp | NeqOp | ShortEqOp;
export interface AndOp {
    and: Expression[];
}
export interface OrOp {
    or: Expression[];
}
export interface NotOp {
    not: Expression;
}
export declare type Expression = FuncOp | AndOp | OrOp | NotOp | CompareOp;
export declare type Func = (param: any, context: any) => boolean;
export declare type FunctionsTable = {
    [k: string]: Func;
};
export declare const evaluate: (expression: Expression, context: any, functionsTable: FunctionsTable) => boolean;
