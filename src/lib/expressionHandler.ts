import {evaluate, validate} from './evaluator';
import {
    Context,
    Expression,
    FunctionsTable,
    ValidationContext
} from '../types';

export class ExpressionHandler<C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    Ignore = never, CustomEvaluatorFuncRunOptions = undefined> {

    constructor(private readonly expression: Expression<C, F, Ignore, CustomEvaluatorFuncRunOptions>,
                private readonly functionsTable: F) {
    }

    public async evaluate(context: C, runOptions: CustomEvaluatorFuncRunOptions): Promise<boolean> {
        return evaluate<C, F, Ignore, CustomEvaluatorFuncRunOptions>(
            this.expression, context, this.functionsTable, runOptions);
    }

    public async validate(validationContext: ValidationContext<C, Ignore>, runOptions: CustomEvaluatorFuncRunOptions)
        : Promise<void> {
        await validate<C, F, Ignore, CustomEvaluatorFuncRunOptions>(
            this.expression, validationContext, this.functionsTable, runOptions);
    }

}
