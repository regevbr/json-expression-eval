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

export interface RuleDefinition<ConsequencePayload, C extends Context,
    F extends FunctionsTable<C, CustomEngineRuleFuncRunOptions>, Ignore, CustomEngineRuleFuncRunOptions> {
  condition: Expression<C, F, Ignore, CustomEngineRuleFuncRunOptions>;
  consequence: RuleConsequence<ConsequencePayload, C, Ignore>;
}

export type EngineRuleFuncRunOptions<CustomEngineRuleFuncRunOptions> = {
  custom: CustomEngineRuleFuncRunOptions;
  validation: boolean;
}

export type RuleFunc<C, ConsequencePayload, CustomEngineRuleFuncRunOptions> = (
  param: any, context: C, runOptions: EngineRuleFuncRunOptions<CustomEngineRuleFuncRunOptions>)
    => void | ResolvedConsequence<ConsequencePayload> | Promise<(void | ResolvedConsequence<ConsequencePayload>)>;

export type RuleFunctionsTable<C, ConsequencePayload, CustomEngineRuleFuncRunOptions> =
    Record<string, RuleFunc<C, ConsequencePayload, CustomEngineRuleFuncRunOptions>>;

export type RuleFunctionParam<ConsequencePayload, C extends Context,
  RF extends RuleFunctionsTable<C, ConsequencePayload, CustomEngineRuleFuncRunOptions>,
    K extends keyof RF, CustomEngineRuleFuncRunOptions> = Awaited<Parameters<RF[K]>[0]>;

export type RuleFunctionsParams<ConsequencePayload, C extends Context,
  RF extends RuleFunctionsTable<C, ConsequencePayload, CustomEngineRuleFuncRunOptions>, CustomEngineRuleFuncRunOptions>
    = {
  [K in keyof RF]: RuleFunctionParam<ConsequencePayload, C, RF, K, CustomEngineRuleFuncRunOptions>;
}

export type Rule<ConsequencePayload, RF extends RuleFunctionsTable<C, ConsequencePayload,
    CustomEngineRuleFuncRunOptions>, C extends Context, F extends FunctionsTable<C, CustomEngineRuleFuncRunOptions>,
    Ignore, CustomEngineRuleFuncRunOptions> =
    RuleDefinition<ConsequencePayload, C, F, Ignore, CustomEngineRuleFuncRunOptions> |
    RequireOnlyOne<RuleFunctionsParams<ConsequencePayload, C, RF, CustomEngineRuleFuncRunOptions>>;
