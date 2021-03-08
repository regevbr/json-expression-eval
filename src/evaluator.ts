import {
    isAndCompareOp, isEqualCompareOp, isGtCompareOp, isGteCompareOp, isLtCompareOp, isLteCompareOp,
    isNotCompareOp,
    isNotEqualCompareOp, isOrCompareOp, _isObject
} from './typeGuards';
import {CompareOp, Context, Expression, FunctionsTable, RequireOnlyOne} from './types';


function evaluateCompareOp<C, F extends FunctionsTable<C>, K extends keyof RequireOnlyOne<CompareOp<C, F>>>(
    op: RequireOnlyOne<CompareOp<C, F>>, key: K, param: any, validation: false): boolean;
function evaluateCompareOp<C, F extends FunctionsTable<C>, K extends keyof RequireOnlyOne<CompareOp<C, F>>>(
    op: RequireOnlyOne<CompareOp<C, F>>, key: K, param: any, validation: true): void;
function evaluateCompareOp<C, F extends FunctionsTable<C>, K extends keyof RequireOnlyOne<CompareOp<C, F>>>(
    op: RequireOnlyOne<CompareOp<C, F>>, key: K, param: any, validation: boolean): boolean | void {
    const value = op[key];
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
    } else if (_isObject(param) && valueKey in param) {
        if (validation) {
            evaluateCompareOp(value, valueKey, param[valueKey], true);
            return;
        } else {
            return evaluateCompareOp(value, valueKey, param[valueKey], false);
        }
    }
    throw new Error(`Invalid expression - unknown op ${valueKey}`);
}

function handleAndOp<C extends Context, F extends FunctionsTable<C>>(andExpression: Expression<C, F>[], context: C,
                                                                     functionsTable: F, validation: false): boolean;
function handleAndOp<C extends Context, F extends FunctionsTable<C>>(andExpression: Expression<C, F>[], context: C,
                                                                     functionsTable: F, validation: true): void;
function handleAndOp<C extends Context, F extends FunctionsTable<C>>(andExpression: Expression<C, F>[], context: C,
                                                                     functionsTable: F, validation: boolean)
    : boolean | void {
    if (andExpression.length === 0) {
        throw new Error('Invalid expression - and operator must have at least one expression');
    }
    if (validation) {
        andExpression.forEach((currExpression) => validate(currExpression, context, functionsTable));
    } else {
        for (const currExpression of andExpression) {
            if (!evaluate(currExpression, context, functionsTable)) {
                return false
            }
        }
        return true;
    }
}

function handleOrOp<C extends Context, F extends FunctionsTable<C>>(orExpression: Expression<C, F>[], context: C,
                                                                    functionsTable: F, validation: false): boolean;
function handleOrOp<C extends Context, F extends FunctionsTable<C>>(orExpression: Expression<C, F>[], context: C,
                                                                    functionsTable: F, validation: true): void;
function handleOrOp<C extends Context, F extends FunctionsTable<C>>(orExpression: Expression<C, F>[], context: C,
                                                                    functionsTable: F, validation: boolean)
    : boolean | void {
    if (orExpression.length === 0) {
        throw new Error('Invalid expression - or operator must have at least one expression');
    }
    if (validation) {
        orExpression.forEach((currExpression) => validate(currExpression, context, functionsTable));
    } else {
        for (const currExpression of orExpression) {
            if (evaluate(currExpression, context, functionsTable)) {
                return true
            }
        }
        return false;
    }
}

function _run<C extends Context, F extends FunctionsTable<C>>(expression: Expression<C, F>, context: C,
                                                              functionsTable: F, validation: false): boolean;
function _run<C extends Context, F extends FunctionsTable<C>>(expression: Expression<C, F>, context: C,
                                                              functionsTable: F, validation: true): void;
function _run<C extends Context, F extends FunctionsTable<C>>(expression: Expression<C, F>, context: C,
                                                              functionsTable: F, validation: boolean): boolean | void {
    const keys = Object.keys(expression);
    if (keys.length !== 1) {
        throw new Error('Invalid expression - too may keys');
    }
    const key = keys[0];
    if (isAndCompareOp<C, F>(expression)) {
        if (validation) {
            handleAndOp(expression.and, context, functionsTable, true);
            return;
        } else {
            return handleAndOp(expression.and, context, functionsTable, false);
        }
    } else if (isOrCompareOp<C, F>(expression)) {
        if (validation) {
            handleOrOp(expression.or, context, functionsTable, true);
            return;
        } else {
            return handleOrOp(expression.or, context, functionsTable, false);
        }
    } else if (isNotCompareOp<C, F>(expression)) {
        if (validation) {
            _run(expression.not, context, functionsTable, true);
            return;
        } else {
            return !_run(expression.not, context, functionsTable, false);
        }
    } else if (key in functionsTable) {
        return validation ? undefined : functionsTable[key](expression[key], context);
    } else if (key in context) {
        if (validation) {
            evaluateCompareOp<C, F, typeof key>(expression, key, context[key], true)
            return;
        } else {
            return evaluateCompareOp<C, F, typeof key>(expression, key, context[key], false)
        }
    }
    throw new Error(`Invalid expression - unknown function ${key}`);
}

export const evaluate = <C extends Context, F extends FunctionsTable<C>>(expression: Expression<C, F>, context: C,
                                                                         functionsTable: F): boolean => {
    return _run(expression, context, functionsTable, false);
};

// Throws in case of validation error. Does not run functions or compare fields
export const validate = <C extends Context, F extends FunctionsTable<C>>(expression: Expression<C, F>, dummyContext: C,
                                                                         functionsTable: F): void => {
    _run(expression, dummyContext, functionsTable, true);
};
