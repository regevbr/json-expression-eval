import {
    AndCompareOp,
    EqualCompareOp,
    Expression,
    FunctionsTable,
    GtCompareOp,
    GteCompareOp,
    LtCompareOp,
    LteCompareOp,
    NotCompareOp,
    NotEqualCompareOp,
    OrCompareOp
} from './types';

export const _isObject = (obj: unknown): boolean => {
    const type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

export const isAndCompareOp = <C, F extends FunctionsTable<C>>(expression: Expression<C, F>):
    expression is AndCompareOp<C, F> => {
    return Array.isArray((expression as AndCompareOp<C, F>).and);
}

export const isOrCompareOp = <C, F extends FunctionsTable<C>>(expression: Expression<C, F>):
    expression is OrCompareOp<C, F> => {
    return Array.isArray((expression as OrCompareOp<C, F>).or);
}

export const isNotCompareOp = <C, F extends FunctionsTable<C>>(expression: Expression<C, F>):
    expression is NotCompareOp<C, F> => {
    return _isObject((expression as NotCompareOp<C, F>).not);
}

export const isGtCompareOp = <C, F extends FunctionsTable<C>, K extends keyof C>(op: unknown)
    : op is GtCompareOp<C, K> => {
    return (op as GtCompareOp<C, K>).gt !== undefined;
}

export const isGteCompareOp = <C, F extends FunctionsTable<C>, K extends keyof C>(op: unknown)
    : op is GteCompareOp<C, K> => {
    return (op as GteCompareOp<C, K>).gte !== undefined;
}

export const isLteCompareOp = <C, F extends FunctionsTable<C>, K extends keyof C>(op: unknown)
    : op is LteCompareOp<C, K> => {
    return (op as LteCompareOp<C, K>).lte !== undefined;
}

export const isLtCompareOp = <C, F extends FunctionsTable<C>, K extends keyof C>(op: unknown)
    : op is LtCompareOp<C, K> => {
    return (op as LtCompareOp<C, K>).lt !== undefined;
}

export const isEqualCompareOp = <C, F extends FunctionsTable<C>, K extends keyof C>(op: unknown)
    : op is EqualCompareOp<C, K> => {
    return (op as EqualCompareOp<C, K>).eq !== undefined;
}

export const isNotEqualCompareOp = <C, F extends FunctionsTable<C>, K extends keyof C>(op: unknown)
    : op is NotEqualCompareOp<C, K> => {
    return (op as NotEqualCompareOp<C, K>).neq !== undefined;
}
