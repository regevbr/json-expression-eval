import {
    AndCompareOp, Context,
    EqualCompareOp,
    ExtendedCompareOp, FuncCompares,
    FunctionsTable,
    BetweenCompareOp,
    GtCompareOp,
    GteCompareOp,
    LtCompareOp,
    LteCompareOp,
    RegexCompareOp,
    RegexiCompareOp,
    NotCompareOp,
    NotEqualCompareOp,
    OrCompareOp, InqCompareOp, NinCompareOp, RuleFunctionsTable, RuleFunctionsParams, Primitive, MathOp
} from '../types';

export const _isObject = (obj: unknown): boolean => {
    const type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

export const isFunctionCompareOp =
    <C extends Context, F extends FunctionsTable<C>, Ignore>(expression: unknown, functionsTable: F, key: string):
        expression is FuncCompares<C, F> => {
        return key in functionsTable;
    }

export const isRuleFunction =
    <ConsequencePayload, C extends Context, RF extends RuleFunctionsTable<C, ConsequencePayload>>(
        expression: unknown, ruleFunctionsTable: RF, key: string):
        expression is RuleFunctionsParams<ConsequencePayload, C, RF> => {
        return key in ruleFunctionsTable;
    }

export const isAndCompareOp =
    <C extends Context, F extends FunctionsTable<C>, Ignore>(expression: unknown):
        expression is AndCompareOp<C, F, Ignore> => {
        return Array.isArray((expression as AndCompareOp<C, F, Ignore>).and);
    }

export const isOrCompareOp = <C extends Context, F extends FunctionsTable<C>, Ignore>(expression: unknown):
    expression is OrCompareOp<C, F, Ignore> => {
    return Array.isArray((expression as OrCompareOp<C, F, Ignore>).or);
}

export const isNotCompareOp = <C extends Context, F extends FunctionsTable<C>, Ignore>(expression: unknown):
    expression is NotCompareOp<C, F, Ignore> => {
    return _isObject((expression as NotCompareOp<C, F, Ignore>).not);
}

export const isBetweenCompareOp = (op: ExtendedCompareOp<any, any, any>)
    : op is BetweenCompareOp<any, any> => {
    return Array.isArray((op as BetweenCompareOp<any, any>).between);
}

export const isGtCompareOp = (op: ExtendedCompareOp<any, any, any>)
    : op is GtCompareOp<any, any> => {
    return (op as GtCompareOp<any, any>).gt !== undefined;
}

export const isGteCompareOp = (op: ExtendedCompareOp<any, any, any>)
    : op is GteCompareOp<any, any> => {
    return (op as GteCompareOp<any, any>).gte !== undefined;
}

export const isLteCompareOp = (op: ExtendedCompareOp<any, any, any>)
    : op is LteCompareOp<any, any> => {
    return (op as LteCompareOp<any, any>).lte !== undefined;
}

export const isLtCompareOp = (op: ExtendedCompareOp<any, any, any>)
    : op is LtCompareOp<any, any> => {
    return (op as LtCompareOp<any, any>).lt !== undefined;
}

export const isRegexCompareOp = (op: ExtendedCompareOp<any, any, any>)
    : op is RegexCompareOp<any, any> => {
    return (op as RegexCompareOp<any, any>).regexp !== undefined;
}

export const isRegexiCompareOp = (op: ExtendedCompareOp<any, any, any>)
    : op is RegexiCompareOp<any, any> => {
    return (op as RegexiCompareOp<any, any>).regexpi !== undefined;
}

export const isEqualCompareOp = (op: ExtendedCompareOp<any, any, any>)
    : op is EqualCompareOp<any, any, any> => {
    return (op as EqualCompareOp<any, any, any>).eq !== undefined;
}

export const isNotEqualCompareOp = (op: ExtendedCompareOp<any, any, any>)
    : op is NotEqualCompareOp<any, any, any> => {
    return (op as NotEqualCompareOp<any, any, any>).neq !== undefined;
}

export const isInqCompareOp = (op: ExtendedCompareOp<any, any, any>)
    : op is InqCompareOp<any, any, any> => {
    return Array.isArray((op as InqCompareOp<any, any, any>).inq);
}

export const isNinCompareOp = (op: ExtendedCompareOp<any, any, any>)
    : op is NinCompareOp<any, any, any> => {
    return Array.isArray((op as NinCompareOp<any, any, any>).nin);
}

export type WithRef = {
    ref: string
}

export const isWithRef = (x: unknown): x is WithRef => Boolean((x as WithRef).ref);
export const isMathOp = (x: unknown): x is MathOp<any, any> => Boolean((x as MathOp<any, any>).op);
