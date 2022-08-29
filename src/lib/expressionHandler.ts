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

    public async evaluate(context: C): Promise<boolean> {
        return evaluate<C, F, Ignore>(this.expression, context, this.functionsTable);
    }

    public async validate(validationContext: ValidationContext<C, Ignore>): Promise<void> {
        await validate<C, F, Ignore>(this.expression, validationContext, this.functionsTable);
    }

}
