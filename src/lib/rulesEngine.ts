import {
    Context,
    FunctionsTable,
    ValidationContext, RuleFunctionsTable, Rule, ResolvedConsequence
} from '../types';
import { evaluateRules, validateRules } from './engine';

export class RulesEngine<ConsequencePayload, C extends Context,
    RF extends RuleFunctionsTable<C, ConsequencePayload, CustomEngineRuleFuncRunOptions>,
    F extends FunctionsTable<C, CustomEngineRuleFuncRunOptions>,
    Ignore = never, CustomEngineRuleFuncRunOptions = undefined> {

    constructor(private readonly functionsTable: F, private readonly ruleFunctionsTable: RF) {
    }

    public async evaluate(rules: Rule<ConsequencePayload, RF, C, F, Ignore,
        CustomEngineRuleFuncRunOptions>[], context: C, runOptions: CustomEngineRuleFuncRunOptions)
        : Promise<void | ResolvedConsequence<ConsequencePayload>> {
        return (await evaluateRules<ConsequencePayload, C, RF, F, Ignore, CustomEngineRuleFuncRunOptions>(
            rules, context,
            this.functionsTable, this.ruleFunctionsTable, true, runOptions))?.[0];
    }

    public async evaluateAll(rules: Rule<ConsequencePayload, RF, C, F, Ignore, CustomEngineRuleFuncRunOptions>[],
                             context: C, runOptions: CustomEngineRuleFuncRunOptions)
        : Promise<void | ResolvedConsequence<ConsequencePayload>[]> {
        return evaluateRules<ConsequencePayload, C, RF, F, Ignore, CustomEngineRuleFuncRunOptions>(
            rules, context,
            this.functionsTable, this.ruleFunctionsTable, false, runOptions);
    }

    public async validate(rules: Rule<ConsequencePayload, RF, C, F, Ignore, CustomEngineRuleFuncRunOptions>[],
                          validationContext: ValidationContext<C, Ignore>, runOptions: CustomEngineRuleFuncRunOptions)
        : Promise<void> {
        await validateRules<ConsequencePayload, C, RF, F, Ignore, CustomEngineRuleFuncRunOptions>(
            rules, validationContext,
            this.functionsTable, this.ruleFunctionsTable, runOptions);
    }

}
