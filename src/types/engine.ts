import {
  Context,
  FunctionsTable,
  Expression,
  StringPaths,
  RequireOnlyOne,
} from './evaluator';

export interface RuleConsequenceMessageParrContextRef<C extends Context, Ignore = never> {
  ref: StringPaths<C, Ignore>;
}

export type RuleConsequenceMessagePart<C extends Context, Ignore = never> =
  string
  | RuleConsequenceMessageParrContextRef<C, Ignore>

export interface ResolvedConsequence<ConsequencePayload> {
  message: string;
  custom: ConsequencePayload;
}

export interface RuleConsequence<ConsequencePayload, C extends Context, Ignore = never> {
  message: string | RuleConsequenceMessagePart<C, Ignore>[];
  custom: ConsequencePayload;
}

export interface RuleDefinition<ConsequencePayload, C extends Context, F extends FunctionsTable<C>, Ignore = never> {
  condition: Expression<C, F, Ignore>;
  consequence: RuleConsequence<ConsequencePayload, C, Ignore>;
}

export type RuleFunc<C, ConsequencePayload> = (
  param: any, context: C) => (void | ResolvedConsequence<ConsequencePayload>);

export type RuleFunctionsTable<C, ConsequencePayload> = Record<string, RuleFunc<C, ConsequencePayload>>;

export type RuleFunctionParam<ConsequencePayload, C extends Context,
  RF extends RuleFunctionsTable<C, ConsequencePayload>, K extends keyof RF> = Parameters<RF[K]>[0];

export type RuleFunctionsParams<ConsequencePayload, C extends Context,
  RF extends RuleFunctionsTable<C, ConsequencePayload>> = {
  [K in keyof RF]: RuleFunctionParam<ConsequencePayload, C, RF, K>;
}

export type Rule<ConsequencePayload, RF extends RuleFunctionsTable<C, ConsequencePayload>,
  C extends Context, F extends FunctionsTable<C>, Ignore = never> =
  RuleDefinition<ConsequencePayload, C, F, Ignore> | RequireOnlyOne<RuleFunctionsParams<ConsequencePayload, C, RF>>;