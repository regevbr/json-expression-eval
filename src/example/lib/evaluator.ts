'use strict';

import {functionsTable} from './functionsFactory';
import {Expression, ExpressionEval} from '../..';
import {Moment} from 'moment';

export interface ExpressionContext {
    userId: string;
    times: number;
    date: Moment;
    nested: {
        value: number;
        nested2: {
            value: number;
        };
    };
}

export type ExpressionFunction = typeof functionsTable;

export const getEvaluator = (expression: Expression<ExpressionContext, ExpressionFunction, Moment>) =>
    new ExpressionEval<ExpressionContext, ExpressionFunction, Moment>(expression, functionsTable);

