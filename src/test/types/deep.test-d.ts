import {ResolvedConsequence, Rule} from '../../index';
import {expectType} from 'tsd';

type ExpressionFunction1 = {
    user: (user: string, context: { userId: string }) => boolean;
}

type ExpressionFunction2 = {
    user: (user: string, context: { userId: string }) => boolean;
}

type Context1 = {
    timesCounter?: number;
    userId: string,
    nested: {
        value2: number | undefined,
        value: number | null,
    },
}

type Context2 = {
    timesCounter?: number;
    userId: string,
    nested: {
        value2: number | undefined,
        value: number | null,
    },
}

type ConsequencePayload1 = {
    a: number;
}

type ConsequencePayload2 = {
    a: number;
}

type RuleFunctionsTable1 = {
    rule1: () => void | ResolvedConsequence<ConsequencePayload1>
}

type RuleFunctionsTable2 = {
    rule1: () => void | ResolvedConsequence<ConsequencePayload2>
}

type Rule1 = Rule<ConsequencePayload1, RuleFunctionsTable1, Context1, ExpressionFunction1, Date, {dryRun: true}>;
type Rule2 = Rule<ConsequencePayload2, RuleFunctionsTable2, Context2, ExpressionFunction2, Date, {dryRun: true}>;

declare const rule1: Rule1;
declare const rule2: Rule2;
declare const fn: (rule: Rule1) => boolean;

expectType<boolean>(fn(rule1));
expectType<boolean>(fn(rule2));
