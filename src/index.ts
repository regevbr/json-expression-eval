"use strict";

import * as _ from 'underscore';

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

export type Expression = FuncOp | AndOp | OrOp | NotOp;

export type ExpressionContext = any;

export type Func = (param: any, context: ExpressionContext) => boolean;

export type FunctionsTable = { [k: string]: Func };

function isAndOp(expression: Expression): expression is AndOp {
    return (<AndOp>expression).and !== undefined;
}

function isOrOp(expression: Expression): expression is OrOp {
    return (<OrOp>expression).or !== undefined;
}

function isNotOp(expression: Expression): expression is NotOp {
    return (<NotOp>expression).not !== undefined;
}

export const evaluate = (expression: Expression, context: ExpressionContext, functionsTable: FunctionsTable): boolean => {
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
            _.each(andExpression, (currExpression: Expression) => {
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
            _.each(orExpression, (currExpression: Expression) => {
                const currResult = _evaluate(currExpression);
                result = result || currResult;
            });
            return result;
        } else if (isNotOp(_expression)) {
            const notExpression = _expression.not;
            return !_evaluate(notExpression);
        } else if (key in functionsTable) {
            return functionsTable[key](_expression[key], context);
        }
        throw new Error(`Invalid expression - unknown function ${key}`);
    };

    return _evaluate(expression);
};
