"use strict";

import {functionsTable} from './functionsFactory';
import {evaluate as _evaluate, Expression} from '../../dist';

export interface ExpressionContext {
    userId: string;
    times: number;
}

export const evaluate = (expression: Expression, context: ExpressionContext): boolean => {
    return _evaluate(expression, context, functionsTable);
};
