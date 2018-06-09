"use strict";

import {Expression} from "../../dist";

import { functionsTable } from './functionsFactory';
import { evaluate as _evaluate } from './../../dist/index';

export interface ExpressionContext {
    userId: string;
    times: number;
}

export const evaluate = (expression: Expression, context: ExpressionContext): boolean => {
    return _evaluate(expression, context, functionsTable);
};
