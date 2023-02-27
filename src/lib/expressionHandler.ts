import {evaluate, validate} from './evaluator';
import {
    Context,
    Expression,
    FunctionsTable,
    ValidationContext
} from '../types';

export class ExpressionHandler<C extends Context, F extends FunctionsTable<C, CustomEngineRuleFuncRunOptions>,
    Ignore = never, CustomEngineRuleFuncRunOptions = never> {

    constructor(private readonly expression: Expression<C, F, Ignore, CustomEngineRuleFuncRunOptions>,
                private readonly functionsTable: F) {
    }

    public async evaluate(context: C, runOptions: CustomEngineRuleFuncRunOptions): Promise<boolean> {
        return evaluate<C, F, Ignore, CustomEngineRuleFuncRunOptions>(
            this.expression, context, this.functionsTable, runOptions);
    }

    public async validate(validationContext: ValidationContext<C, Ignore>, runOptions: CustomEngineRuleFuncRunOptions)
        : Promise<void> {
        await validate<C, F, Ignore, CustomEngineRuleFuncRunOptions>(
            this.expression, validationContext, this.functionsTable, runOptions);
    }

}
