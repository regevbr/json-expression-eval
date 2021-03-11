import {
    isAndCompareOp, isEqualCompareOp, isGtCompareOp, isGteCompareOp, isLtCompareOp, isLteCompareOp,
    isNotCompareOp,
    isNotEqualCompareOp, isOrCompareOp, _isObject, isFunctionCompareOp
} from './typeGuards';
import {Context, Expression, FunctionsTable, ExtendedCompareOp} from './types';
import {getFromPath} from './getFromPath';

const assertUnreachable = <T = never>(x: never, message: string): T => {
    throw new Error(message);
};

function evaluateCompareOp(value: ExtendedCompareOp<any>, param: any, validation: false): boolean;
function evaluateCompareOp(value: ExtendedCompareOp<any>, param: any, validation: true): void;
function evaluateCompareOp(value: ExtendedCompareOp<any>, param: any, validation: boolean): boolean | void {
    if (!_isObject(value)) {
        return validation ? undefined : param === value;
    }
    const keys = Object.keys(value);
    if (keys.length !== 1) {
        throw new Error('Invalid expression - too may keys');
    }
    const valueKey = keys[0];
    if (isGtCompareOp(value)) {
        return validation ? undefined : param > value.gt;
    } else if (isGteCompareOp(value)) {
        return validation ? undefined : param >= value.gte;
    } else if (isLteCompareOp(value)) {
        return validation ? undefined : param <= value.lte;
    } else if (isLtCompareOp(value)) {
        return validation ? undefined : param < value.lt;
    } else if (isEqualCompareOp(value)) {
        return validation ? undefined : param === value.eq;
    } else if (isNotEqualCompareOp(value)) {
        return validation ? undefined : param !== value.neq;
    } else {
        assertUnreachable(value, `Invalid expression - unknown op ${valueKey}`);
    }
}

function handleAndOp<C extends Context, F extends FunctionsTable<C>, Ignore>
(andExpression: Expression<C, F, Ignore>[], context: C, functionsTable: F, validation: false): boolean;
function handleAndOp<C extends Context, F extends FunctionsTable<C>, Ignore>
(andExpression: Expression<C, F, Ignore>[], context: C, functionsTable: F, validation: true): void;
function handleAndOp<C extends Context, F extends FunctionsTable<C>, Ignore>
(andExpression: Expression<C, F, Ignore>[], context: C, functionsTable: F, validation: boolean)
    : boolean | void {
    if (andExpression.length === 0) {
        throw new Error('Invalid expression - and operator must have at least one expression');
    }
    if (validation) {
        andExpression.forEach(
            (currExpression) => validate<C, F, Ignore>(currExpression, context, functionsTable)
        );
    } else {
        for (const currExpression of andExpression) {
            if (!evaluate<C, F, Ignore>(currExpression, context, functionsTable)) {
                return false
            }
        }
        return true;
    }
}

function handleOrOp<C extends Context, F extends FunctionsTable<C>, Ignore>
(orExpression: Expression<C, F, Ignore>[], context: C, functionsTable: F, validation: false): boolean;
function handleOrOp<C extends Context, F extends FunctionsTable<C>, Ignore>
(orExpression: Expression<C, F, Ignore>[], context: C, functionsTable: F, validation: true): void;
function handleOrOp<C extends Context, F extends FunctionsTable<C>, Ignore>
(orExpression: Expression<C, F, Ignore>[], context: C, functionsTable: F, validation: boolean)
    : boolean | void {
    if (orExpression.length === 0) {
        throw new Error('Invalid expression - or operator must have at least one expression');
    }
    if (validation) {
        orExpression.forEach(
            (currExpression) => validate<C, F, Ignore>(currExpression, context, functionsTable)
        );
    } else {
        for (const currExpression of orExpression) {
            if (evaluate<C, F, Ignore>(currExpression, context, functionsTable)) {
                return true
            }
        }
        return false;
    }
}

function _run<C extends Context, F extends FunctionsTable<C>, Ignore>
(expression: Expression<C, F, Ignore>, context: C, functionsTable: F, validation: false): boolean;
function _run<C extends Context, F extends FunctionsTable<C>, Ignore>
(expression: Expression<C, F, Ignore>, context: C, functionsTable: F, validation: true): void;
function _run<C extends Context, F extends FunctionsTable<C>, Ignore>
(expression: Expression<C, F, Ignore>, context: C, functionsTable: F, validation: boolean): boolean | void {
    const keys = Object.keys(expression);
    if (keys.length !== 1) {
        throw new Error('Invalid expression - too may keys');
    }
    const key = keys[0];
    if (isAndCompareOp<C, F, Ignore>(expression)) {
        if (validation) {
            handleAndOp<C, F, Ignore>(expression.and, context, functionsTable, true);
            return;
        } else {
            return handleAndOp<C, F, Ignore>(expression.and, context, functionsTable, false);
        }
    } else if (isOrCompareOp<C, F, Ignore>(expression)) {
        if (validation) {
            handleOrOp<C, F, Ignore>(expression.or, context, functionsTable, true);
            return;
        } else {
            return handleOrOp<C, F, Ignore>(expression.or, context, functionsTable, false);
        }
    } else if (isNotCompareOp<C, F, Ignore>(expression)) {
        if (validation) {
            _run<C, F, Ignore>(expression.not, context, functionsTable, true);
            return;
        } else {
            return !_run<C, F, Ignore>(expression.not, context, functionsTable, false);
        }
    } else if (isFunctionCompareOp<C, F, Ignore>(expression, functionsTable, key)) {
        return validation ? undefined : functionsTable[key](expression[key], context);
    } else {
        const value = getFromPath(context, key);
        if (validation) {
            evaluateCompareOp((expression as any)[key], value, true)
            return;
        } else {
            return evaluateCompareOp((expression as any)[key], value, false)
        }
    }
}

export const evaluate = <C extends Context, F extends FunctionsTable<C>, Ignore = never>
(expression: Expression<C, F, Ignore>, context: C, functionsTable: F): boolean => {
    return _run<C, F, Ignore>(expression, context, functionsTable, false);
};

// Throws in case of validation error. Does not run functions or compare fields
export const validate = <C extends Context, F extends FunctionsTable<C>, Ignore = never>
(expression: Expression<C, F, Ignore>, dummyContext: C, functionsTable: F): void => {
    _run<C, F, Ignore>(expression, dummyContext, functionsTable, true);
};
