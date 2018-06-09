import { Expression } from '../../dist';
export interface ExpressionContext {
    userId: string;
    times: number;
}
export declare const evaluate: (expression: Expression, context: ExpressionContext) => boolean;
