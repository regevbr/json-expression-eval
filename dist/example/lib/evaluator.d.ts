import { functionsTable } from './functionsFactory';
import { Expression } from '../..';
export interface ExpressionContext {
    userId: string;
    times: number;
}
export declare type ExpressionFunction = typeof functionsTable;
export declare const evaluate: (expression: Expression<ExpressionContext, {
    user: (user: string, context: {
        userId: string;
    }) => boolean;
    maxCount: (maxCount: number, context: {
        times: number;
    }) => boolean;
}>, context: ExpressionContext) => boolean;
