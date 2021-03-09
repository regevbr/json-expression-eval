'use strict';

import {evaluate, validate} from './evaluator';
import {ExpressionParts} from './expressionParts';
import {Context, Expression, FunctionsTable} from './types';

export * from './types';
export * from './evaluator';
export * from './expressionParts';

export class ExpressionEval<C extends Context, F extends FunctionsTable<C>> {

    constructor(private readonly expression: Expression<C, F>, private readonly functionsTable: F) {
    }

    public evaluate(context: C): boolean {
        return evaluate(this.expression, context, this.functionsTable);
    }

    public validate(dummyContext: C): void {
        validate(this.expression, dummyContext, this.functionsTable);
    }

}

export type GetExpressionParts<E extends ExpressionEval<any, any>, Extra extends object = {}> =
    E extends ExpressionEval<infer C, infer F> ? ExpressionParts<C, F, Extra> : never;
