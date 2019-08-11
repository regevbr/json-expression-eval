'use strict';

import {functionsTable} from './functionsFactory';
import {evaluate as _evaluate, Expression, FunctionsTable} from '../..';

export interface ExpressionContext {
    userId: string;
    times: number;
}

export type ExpressionFunction = typeof functionsTable;

export const evaluate = (expression: Expression<ExpressionContext, ExpressionFunction>, context: ExpressionContext):
    boolean => {
    return _evaluate(expression, context, functionsTable);
};
