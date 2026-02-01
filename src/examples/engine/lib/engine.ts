import { functionsTable, ruleFunctionsTable } from './functionsFactory';
import { RulesEngine, Rule } from '../../..';
import { Moment } from 'moment';

export interface ExpressionContext {
  userId: string;
  times: number;
  date: Moment;
  nested: {
    value: number;
    nested2: {
      value: number;
    };
  };
}

export type Ignore = Moment;
export type Payload = number;
export type ExpressionFunction = typeof functionsTable;
export type RuleFunction = typeof ruleFunctionsTable;
export type CustomEngineRuleFuncRunOptions = {dryRun: boolean};
export type MyRule = Rule<Payload, RuleFunction, ExpressionContext, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>;
export const engine = new RulesEngine<Payload, ExpressionContext, RuleFunction, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>
(functionsTable, ruleFunctionsTable);
