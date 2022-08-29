import {
    Context,
    FunctionsTable,
    ValidationContext, RuleFunctionsTable, Rule, ResolvedConsequence
} from '../types';
import {evaluateRules, validateRules} from './engine';

export class RulesEngine<ConsequencePayload, C extends Context,
    RF extends RuleFunctionsTable<C, ConsequencePayload>, F extends FunctionsTable<C>, Ignore = never> {

    constructor(private readonly functionsTable: F, private readonly ruleFunctionsTable: RF) {
    }

    public async evaluate(rules: Rule<ConsequencePayload, RF, C, F, Ignore>[], context: C)
        : Promise<void | ResolvedConsequence<ConsequencePayload>> {
        return (await evaluateRules<ConsequencePayload, C, RF, F, Ignore>(rules, context,
            this.functionsTable, this.ruleFunctionsTable, true))?.[0];
    }

    public async evaluateAll(rules: Rule<ConsequencePayload, RF, C, F, Ignore>[], context: C)
        : Promise<void | ResolvedConsequence<ConsequencePayload>[]> {
        return evaluateRules<ConsequencePayload, C, RF, F, Ignore>(rules, context,
            this.functionsTable, this.ruleFunctionsTable, false);
    }

    public async validate(rules: Rule<ConsequencePayload, RF, C, F, Ignore>[],
                          validationContext: ValidationContext<C, Ignore>): Promise<void> {
        await validateRules<ConsequencePayload, C, RF, F, Ignore>(rules, validationContext,
            this.functionsTable, this.ruleFunctionsTable);
    }

}
