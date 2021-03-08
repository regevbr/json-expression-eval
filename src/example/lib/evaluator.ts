'use strict';

import {functionsTable} from './functionsFactory';
import {Expression, ExpressionEval} from '../..';

export interface ExpressionContext {
    userId: string;
    times: number;
    nested: {
        value: number;
        nested2: {
            value: number;
        };
    };
}

export type ExpressionFunction = typeof functionsTable;

export const getEvaluator = (expression: Expression<ExpressionContext, ExpressionFunction>) =>
    new ExpressionEval<ExpressionContext, ExpressionFunction>(expression, functionsTable);

