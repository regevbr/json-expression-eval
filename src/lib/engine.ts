import {RuleFunctionsTable, Rule, FunctionsTable, Context, ResolvedConsequence, ValidationContext} from '../types';
import {evaluate, validate} from './evaluator';
import {objectKeys} from './helpers';
import {isRuleFunction} from './typeGuards';
import {evaluateEngineConsequence} from './engineConsequenceEvaluator';

async function run<ConsequencePayload, C extends Context,
    RF extends RuleFunctionsTable<C, ConsequencePayload>, F extends FunctionsTable<C>, Ignore = never>
(rules: Rule<ConsequencePayload, RF, C, F, Ignore>[], context: C, functionsTable: F, ruleFunctionsTable: RF,
 haltOnFirstMatch: boolean, validation: false)
    : Promise<void | ResolvedConsequence<ConsequencePayload>[]>
async function run<ConsequencePayload, C extends Context,
    RF extends RuleFunctionsTable<C, ConsequencePayload>, F extends FunctionsTable<C>, Ignore = never>
(rules: Rule<ConsequencePayload, RF, C, F, Ignore>[], context: ValidationContext<C, Ignore>,
 functionsTable: F, ruleFunctionsTable: RF,
 haltOnFirstMatch: boolean, validation: true)
    : Promise<void | ResolvedConsequence<ConsequencePayload>[]>
async function run<ConsequencePayload, C extends Context,
    RF extends RuleFunctionsTable<C, ConsequencePayload>, F extends FunctionsTable<C>, Ignore = never>
(rules: Rule<ConsequencePayload, RF, C, F, Ignore>[], context: C | ValidationContext<C, Ignore>, functionsTable: F,
 ruleFunctionsTable: RF, haltOnFirstMatch: boolean, validation: boolean)
    : Promise<void | ResolvedConsequence<ConsequencePayload>[]> {
    const errors: ResolvedConsequence<ConsequencePayload>[] = [];
    for (const rule of rules) {
        const keys = objectKeys(rule);
        const key = keys[0];
        if (keys.length === 1 && key && isRuleFunction<ConsequencePayload, C, RF>(rule, ruleFunctionsTable, key)) {
            const consequence = await ruleFunctionsTable[key](rule[key], context as C, {validation});
            if (consequence) {
                errors.push(consequence);
                if (haltOnFirstMatch && !validation) {
                    return errors;
                }
            }
        } else {
            if (!rule.condition) {
                throw new Error(`Missing condition for rule`);
            }
            if (!rule.consequence) {
                throw new Error(`Missing consequence for rule`);
            }
            if (validation) {
                await validate<C, F, Ignore>(rule.condition, context as ValidationContext<C, Ignore>, functionsTable);
                await evaluateEngineConsequence<ConsequencePayload, C, Ignore>(context as C, rule.consequence);
            } else {
                const ruleApplies = await evaluate<C, F, Ignore>(rule.condition, context as C, functionsTable);
                if (ruleApplies) {
                    const consequence =
                        await evaluateEngineConsequence<ConsequencePayload, C, Ignore>(context as C, rule.consequence);
                    errors.push(consequence);
                    if (haltOnFirstMatch) {
                        return errors;
                    }
                }
            }
        }
    }
    return errors.length ? errors : undefined;
}

export const evaluateRules = async <ConsequencePayload, C extends Context,
    RF extends RuleFunctionsTable<C, ConsequencePayload>, F extends FunctionsTable<C>, Ignore = never>
(rules: Rule<ConsequencePayload, RF, C, F, Ignore>[], context: C, functionsTable: F, ruleFunctionsTable: RF,
 haltOnFirstMatch: boolean)
    : Promise<void | ResolvedConsequence<ConsequencePayload>[]> => {
    return run<ConsequencePayload, C, RF, F, Ignore>(
        rules, context, functionsTable, ruleFunctionsTable, haltOnFirstMatch, false);
}

export const validateRules = async <ConsequencePayload, C extends Context,
    RF extends RuleFunctionsTable<C, ConsequencePayload>, F extends FunctionsTable<C>, Ignore = never>
(rules: Rule<ConsequencePayload, RF, C, F, Ignore>[], validationContext: ValidationContext<C, Ignore>,
 functionsTable: F, ruleFunctionsTable: RF)
    : Promise<void> => {
    await run<ConsequencePayload, C, RF, F, Ignore>(rules, validationContext, functionsTable,
        ruleFunctionsTable, false, true);
}
