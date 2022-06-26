import {RuleFunctionsTable, Rule, FunctionsTable, Context, ResolvedConsequence, ValidationContext} from '../types';
import {evaluate, validate} from './evaluator';
import {objectKeys} from './helpers';
import {isRuleFunction} from './typeGuards';
import {evaluateEngineConsequence} from './engineConsequenceEvaluator';

function run<ConsequencePayload, C extends Context,
  RF extends RuleFunctionsTable<C, ConsequencePayload>, F extends FunctionsTable<C>, Ignore = never>
(rules: Rule<ConsequencePayload, RF, C, F, Ignore>[], context: C, functionsTable: F, ruleFunctionsTable: RF,
 haltOnFirstMatch: boolean, validation: false)
  : void | ResolvedConsequence<ConsequencePayload>[]
function run<ConsequencePayload, C extends Context,
  RF extends RuleFunctionsTable<C, ConsequencePayload>, F extends FunctionsTable<C>, Ignore = never>
(rules: Rule<ConsequencePayload, RF, C, F, Ignore>[], context: ValidationContext<C, Ignore>,
 functionsTable: F, ruleFunctionsTable: RF,
 haltOnFirstMatch: boolean, validation: true)
  : void | ResolvedConsequence<ConsequencePayload>[]
function run<ConsequencePayload, C extends Context,
  RF extends RuleFunctionsTable<C, ConsequencePayload>, F extends FunctionsTable<C>, Ignore = never>
(rules: Rule<ConsequencePayload, RF, C, F, Ignore>[], context: C | ValidationContext<C, Ignore>, functionsTable: F,
 ruleFunctionsTable: RF, haltOnFirstMatch: boolean, validation: boolean)
  : void | ResolvedConsequence<ConsequencePayload>[] {
  const errors: ResolvedConsequence<ConsequencePayload>[] = [];
  for (const rule of rules) {
    const keys = objectKeys(rule);
    const key = keys[0];
    if (keys.length === 1 && key && isRuleFunction<ConsequencePayload, C, RF>(rule, ruleFunctionsTable, key)) {
      const consequence = ruleFunctionsTable[key](rule[key], context as C);
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
        validate<C, F, Ignore>(rule.condition, context as ValidationContext<C, Ignore>, functionsTable);
        evaluateEngineConsequence<ConsequencePayload, C, Ignore>(context as C, rule.consequence);
      } else {
        const ruleApplies = evaluate<C, F, Ignore>(rule.condition, context as C, functionsTable);
        if (ruleApplies) {
          const consequence = evaluateEngineConsequence<ConsequencePayload, C, Ignore>(context as C, rule.consequence);
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

export const evaluateRules = <ConsequencePayload, C extends Context,
  RF extends RuleFunctionsTable<C, ConsequencePayload>, F extends FunctionsTable<C>, Ignore = never>
(rules: Rule<ConsequencePayload, RF, C, F, Ignore>[], context: C, functionsTable: F, ruleFunctionsTable: RF,
 haltOnFirstMatch: boolean)
  : void | ResolvedConsequence<ConsequencePayload>[] => {
  return run<ConsequencePayload, C, RF, F, Ignore>(
    rules, context, functionsTable, ruleFunctionsTable, haltOnFirstMatch, false);
}

export const validateRules = <ConsequencePayload, C extends Context,
  RF extends RuleFunctionsTable<C, ConsequencePayload>, F extends FunctionsTable<C>, Ignore = never>
(rules: Rule<ConsequencePayload, RF, C, F, Ignore>[], validationContext: ValidationContext<C, Ignore>,
 functionsTable: F, ruleFunctionsTable: RF)
  : void => {
  run<ConsequencePayload, C, RF, F, Ignore>(rules, validationContext, functionsTable, ruleFunctionsTable, false, true);
}