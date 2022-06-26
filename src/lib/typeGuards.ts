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
    OrCompareOp, InqCompareOp, NinCompareOp, RuleFunctionsTable, RuleFunctionsParams
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

  export const isBetweenCompareOp = (op: ExtendedCompareOp)
    : op is BetweenCompareOp => {
    return Array.isArray((op as BetweenCompareOp).between);
  }

  export const isGtCompareOp = (op: ExtendedCompareOp)
    : op is GtCompareOp => {
    return (op as GtCompareOp).gt !== undefined;
  }

  export const isGteCompareOp = (op: ExtendedCompareOp)
    : op is GteCompareOp => {
    return (op as GteCompareOp).gte !== undefined;
  }

  export const isLteCompareOp = (op: ExtendedCompareOp)
    : op is LteCompareOp => {
    return (op as LteCompareOp).lte !== undefined;
  }

  export const isLtCompareOp = (op: ExtendedCompareOp)
    : op is LtCompareOp => {
    return (op as LtCompareOp).lt !== undefined;
  }

  export const isRegexCompareOp = (op: ExtendedCompareOp)
    : op is RegexCompareOp => {
    return (op as RegexCompareOp).regexp !== undefined;
  }

  export const isRegexiCompareOp = (op: ExtendedCompareOp)
    : op is RegexiCompareOp => {
    return (op as RegexiCompareOp).regexpi !== undefined;
  }

  export const isEqualCompareOp = <V>(op: ExtendedCompareOp)
    : op is EqualCompareOp<V> => {
    return (op as EqualCompareOp<V>).eq !== undefined;
  }

  export const isNotEqualCompareOp = <V>(op: ExtendedCompareOp)
    : op is NotEqualCompareOp<V> => {
    return (op as NotEqualCompareOp<V>).neq !== undefined;
  }

  export const isInqCompareOp = <V>(op: ExtendedCompareOp)
    : op is InqCompareOp<V> => {
    return Array.isArray((op as InqCompareOp<V>).inq);
  }

  export const isNinCompareOp = <V>(op: ExtendedCompareOp)
    : op is NinCompareOp<V> => {
    return Array.isArray((op as NinCompareOp<V>).nin);
  }
