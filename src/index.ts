'use strict';

import {evaluate, validate} from './evaluator';
import {Context, Expression, FunctionsTable} from './types';

export * from './types';
export * from './evaluator';
export * from './expressionParts';

export class ExpressionEval<C extends Context, F extends FunctionsTable<C>, Ignore = never> {

    constructor(private readonly expression: Expression<C, F, Ignore>, private readonly functionsTable: F) {
    }

    public evaluate(context: C): boolean {
        return evaluate<C, F, Ignore>(this.expression, context, this.functionsTable);
    }

    public validate(dummyContext: C): void {
        validate<C, F, Ignore>(this.expression, dummyContext, this.functionsTable);
    }

}
