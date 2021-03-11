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

function evaluateCompareOp
(expressionValue: ExtendedCompareOp<any>, contextValue: any, key: string, validation: false): boolean;
function evaluateCompareOp
(expressionValue: ExtendedCompareOp<any>, contextValue: any, key: string, validation: true): void;
function evaluateCompareOp
(expressionValue: ExtendedCompareOp<any>, contextValue: any, key: string, validation: boolean): boolean | void {
    if (!_isObject(expressionValue)) {
        return validation ? undefined : contextValue === expressionValue;
    }
    const keys = Object.keys(expressionValue);
    if (keys.length !== 1) {
        throw new Error('Invalid expression - too may keys');
    }
    if (isEqualCompareOp(expressionValue)) {
        return validation ? undefined : contextValue === expressionValue.eq;
    } else if (isNotEqualCompareOp(expressionValue)) {
        return validation ? undefined : contextValue !== expressionValue.neq;
    } else {
        const assertNumber = (value: any) => {
            if (typeof value !== 'number') {
                throw new Error(`Invalid expression - ${key} must be a number`);
            }
        }
        if (isGtCompareOp(expressionValue)) {
            assertNumber(expressionValue.gt);
            return validation ? undefined : contextValue > expressionValue.gt;
        } else if (isGteCompareOp(expressionValue)) {
            assertNumber(expressionValue.gte);
            return validation ? undefined : contextValue >= expressionValue.gte;
        } else if (isLteCompareOp(expressionValue)) {
            assertNumber(expressionValue.lte);
            return validation ? undefined : contextValue <= expressionValue.lte;
        } else if (isLtCompareOp(expressionValue)) {
            assertNumber(expressionValue.lt);
            return validation ? undefined : contextValue < expressionValue.lt;
        } else {
            assertUnreachable(expressionValue, `Invalid expression - unknown op ${keys[0]}`);
        }
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
    // TODO reduce code complexity
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
        // TODO on validate we should throw here
        const contextValue = getFromPath(context, key);
        if (validation) {
            // TODO fix the TS error here
            evaluateCompareOp(expression[key], contextValue, key, true)
            return;
        } else {
            // TODO fix the TS error here
            return evaluateCompareOp(expression[key], contextValue, key, false);
        }
    }
}

export const evaluate = <C extends Context, F extends FunctionsTable<C>, Ignore = never>
(expression: Expression<C, F, Ignore>, context: C, functionsTable: F): boolean => {
    return _run<C, F, Ignore>(expression, context, functionsTable, false);
};

// Throws in case of validation error. Does not run functions or compare fields
// TODO ask for non nullable context so we can verify all the context paths exist
export const validate = <C extends Context, F extends FunctionsTable<C>, Ignore = never>
(expression: Expression<C, F, Ignore>, dummyContext: C, functionsTable: F): void => {
    _run<C, F, Ignore>(expression, dummyContext, functionsTable, true);
};
