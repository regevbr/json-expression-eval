import {
    AndCompareOp,
    EqualCompareOp,
    Expression, ExtendedCompareOp, FuncCompares,
    FunctionsTable,
    GtCompareOp,
    GteCompareOp,
    LtCompareOp,
    LteCompareOp,
    NotCompareOp,
    NotEqualCompareOp,
    OrCompareOp, RequireOnlyOne
} from './types';

export const _isObject = (obj: unknown): boolean => {
    const type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

export const isFunctionCompareOp =
    <C, F extends FunctionsTable<C>, Ignore>(expression: Expression<C, F, Ignore>, functionsTable: F, key: string):
        expression is RequireOnlyOne<FuncCompares<C, F>> => {
        return key in functionsTable;
    }

export const isAndCompareOp = <C, F extends FunctionsTable<C>, Ignore>(expression: Expression<C, F, Ignore>):
    expression is AndCompareOp<C, F, Ignore> => {
    return Array.isArray((expression as AndCompareOp<C, F, Ignore>).and);
}

export const isOrCompareOp = <C, F extends FunctionsTable<C>, Ignore>(expression: Expression<C, F, Ignore>):
    expression is OrCompareOp<C, F, Ignore> => {
    return Array.isArray((expression as OrCompareOp<C, F, Ignore>).or);
}

export const isNotCompareOp = <C, F extends FunctionsTable<C>, Ignore>(expression: Expression<C, F, Ignore>):
    expression is NotCompareOp<C, F, Ignore> => {
    return _isObject((expression as NotCompareOp<C, F, Ignore>).not);
}

export const isGtCompareOp = (op: ExtendedCompareOp<any>)
    : op is GtCompareOp => {
    return (op as GtCompareOp).gt !== undefined;
}

export const isGteCompareOp = (op: ExtendedCompareOp<any>)
    : op is GteCompareOp => {
    return (op as GteCompareOp).gte !== undefined;
}

export const isLteCompareOp = (op: ExtendedCompareOp<any>)
    : op is LteCompareOp => {
    return (op as LteCompareOp).lte !== undefined;
}

export const isLtCompareOp = (op: ExtendedCompareOp<any>)
    : op is LtCompareOp => {
    return (op as LtCompareOp).lt !== undefined;
}

export const isEqualCompareOp = <V>(op: ExtendedCompareOp<any>)
    : op is EqualCompareOp<V> => {
    return (op as EqualCompareOp<V>).eq !== undefined;
}

export const isNotEqualCompareOp = <V>(op: ExtendedCompareOp<any>)
    : op is NotEqualCompareOp<V> => {
    return (op as NotEqualCompareOp<V>).neq !== undefined;
}
