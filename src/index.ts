"use strict";

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

export type CompareOp = GtOp | GteOp | LtOp | LteOp | EqOp | NeqOp | ShortEqOp ;

function isGtOp<T>(op: CompareOp, key: string): op is GtOp {
    return (<GtOp>op)[key].gt !== undefined;
}

function isGteOp<T>(op: CompareOp, key: string): op is GteOp {
    return (<GteOp>op)[key].gte !== undefined;
}

function isLteOp<T>(op: CompareOp, key: string): op is LteOp {
    return (<LteOp>op)[key].lte !== undefined;
}

function isLtOp<T>(op: CompareOp, key: string): op is LtOp {
    return (<LtOp>op)[key].lt !== undefined;
}

function isEqOp<T>(op: CompareOp, key: string): op is EqOp {
    return (<EqOp>op)[key].eq !== undefined;
}

function isNeqOp<T>(op: CompareOp, key: string): op is NeqOp {
    return (<NeqOp>op)[key].neq !== undefined;
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

export type Expression = FuncOp | AndOp | OrOp | NotOp | CompareOp;

export type Func<T> = (param: any, context: T) => boolean;

export type FunctionsTable<T> = { [k: string]: Func<T> };

function isAndOp(expression: Expression): expression is AndOp {
    return (<AndOp>expression).and !== undefined;
}

function isOrOp(expression: Expression): expression is OrOp {
    return (<OrOp>expression).or !== undefined;
}

function isNotOp(expression: Expression): expression is NotOp {
    return (<NotOp>expression).not !== undefined;
}

function isFuncOp<T>(expression: Expression, key: string, functionsTable: FunctionsTable<T>): expression is FuncOp {
    return key in functionsTable;
}

const _isObject = (obj: any) => {
    const type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

const _evaluateCompareOp = (op: CompareOp, key: string, param: any): boolean => {
    if (!_isObject(op[key])) {
        return param === op[key];
    }
    const keys = Object.keys(op[key]);
    if (keys.length !== 1) {
        throw new Error('Invalid expression - too may keys');
    }
    if (isGtOp(op, key)) {
        return param > op[key].gt;
    } else if (isGteOp(op, key)) {
        return param >= op[key].gte;
    } else if (isLteOp(op, key)) {
        return param <= op[key].lte;
    } else if (isLtOp(op, key)) {
        return param < op[key].lt;
    } else if (isEqOp(op, key)) {
        return param === op[key].eq;
    } else if (isNeqOp(op, key)) {
        return param !== op[key].neq;
    }
    throw new Error(`Invalid expression - unknown op ${keys[0]}`);
};

export interface Context {
    [index: string]: any;
}

export const evaluate = <T extends Context>(expression: Expression, context: T, functionsTable: FunctionsTable<T>): boolean => {
    const _evaluate = (_expression: Expression): boolean => {
        const keys = Object.keys(_expression);
        if (keys.length !== 1) {
            throw new Error('Invalid expression - too may keys');
        }
        const key = keys[0];
        if (isAndOp(_expression)) {
            const andExpression = _expression.and;
            if (andExpression.length === 0) {
                throw new Error('Invalid expression - and operator must have at least one expression');
            }
            let result = true;
            andExpression.forEach((currExpression: Expression) => {
                const currResult = _evaluate(currExpression);
                result = result && currResult;
            });
            return result;
        } else if (isOrOp(_expression)) {
            const orExpression = _expression.or;
            if (orExpression.length === 0) {
                throw new Error('Invalid expression - or operator must have at least one expression');
            }
            let result = false;
            orExpression.forEach((currExpression: Expression) => {
                const currResult = _evaluate(currExpression);
                result = result || currResult;
            });
            return result;
        } else if (isNotOp(_expression)) {
            const notExpression = _expression.not;
            return !_evaluate(notExpression);
        } else if (isFuncOp(_expression, key, functionsTable)) {
            return functionsTable[key](_expression[key], context);
        } else if (key in context) {
            return _evaluateCompareOp(_expression, key, context[key]);
        }
        throw new Error(`Invalid expression - unknown function ${key}`);
    };

    return _evaluate(expression);
};
