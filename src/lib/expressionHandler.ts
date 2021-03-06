'use strict';

import {evaluate, validate} from './evaluator';
import {
    Context,
    Expression,
    FunctionsTable,
    ValidationContext
} from '../types';

export class ExpressionHandler<C extends Context, F extends FunctionsTable<C>, Ignore = never> {

    constructor(private readonly expression: Expression<C, F, Ignore>, private readonly functionsTable: F) {
    }

    public evaluate(context: C): boolean {
        return evaluate<C, F, Ignore>(this.expression, context, this.functionsTable);
    }

    public validate(validationContext: ValidationContext<C, Ignore>): void {
        validate<C, F, Ignore>(this.expression, validationContext, this.functionsTable);
    }

}
