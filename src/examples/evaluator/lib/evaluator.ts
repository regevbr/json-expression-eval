import {functionsTable} from './functionsFactory';
import {Expression, ExpressionHandler} from '../../..';
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

export type CustomEngineRuleFuncRunOptions = {dryRun: boolean};

export const getEvaluator = (expression: Expression<ExpressionContext, ExpressionFunction,
    Moment, CustomEngineRuleFuncRunOptions>) =>
    new ExpressionHandler<ExpressionContext, ExpressionFunction, Moment, CustomEngineRuleFuncRunOptions>
    (expression, functionsTable);

