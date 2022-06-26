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

  public evaluate(rules: Rule<ConsequencePayload, RF, C, F, Ignore>[], context: C)
    : void | ResolvedConsequence<ConsequencePayload> {
    return evaluateRules<ConsequencePayload, C, RF, F, Ignore>(rules, context,
      this.functionsTable, this.ruleFunctionsTable, true)?.[0];
  }

  public evaluateAll(rules: Rule<ConsequencePayload, RF, C, F, Ignore>[], context: C, haltOnFirstMatch?: boolean)
    : void | ResolvedConsequence<ConsequencePayload>[] {
    return evaluateRules<ConsequencePayload, C, RF, F, Ignore>(rules, context,
      this.functionsTable, this.ruleFunctionsTable, false);
  }

  public validate(rules: Rule<ConsequencePayload, RF, C, F, Ignore>[], validationContext: ValidationContext<C, Ignore>)
    : void {
    validateRules<ConsequencePayload, C, RF, F, Ignore>(rules, validationContext,
      this.functionsTable, this.ruleFunctionsTable);
  }

}
