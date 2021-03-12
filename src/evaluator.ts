import {
    isAndCompareOp, isEqualCompareOp, isGtCompareOp, isGteCompareOp, isLtCompareOp, isLteCompareOp,
    isNotCompareOp,
    isNotEqualCompareOp, isOrCompareOp, _isObject, isFunctionCompareOp
} from './typeGuards';
import {Context, Expression, FunctionsTable, ExtendedCompareOp, NumberCompareOps, ValidationContext} from './types';
import {assertUnreachable, objectKeys, getFromPath, getNumberAsserter} from './helpers';

function evaluateNumberCompareOp
(expressionValue: NumberCompareOps, expressionKey: string, contextValue: any, compareKey: string): boolean {
    const assertNumber = getNumberAsserter(expressionKey);
    if (isGtCompareOp(expressionValue)) {
        assertNumber(expressionValue.gt);
        return contextValue > expressionValue.gt;
    } else if (isGteCompareOp(expressionValue)) {
        assertNumber(expressionValue.gte);
        return contextValue >= expressionValue.gte;
    } else if (isLteCompareOp(expressionValue)) {
        assertNumber(expressionValue.lte);
        return contextValue <= expressionValue.lte;
    } else if (isLtCompareOp(expressionValue)) {
        assertNumber(expressionValue.lt);
        return contextValue < expressionValue.lt;
    } else {
        return assertUnreachable(expressionValue, `Invalid expression - unknown op ${compareKey}`);
    }
}

function evaluateCompareOp(expressionValue: ExtendedCompareOp, expressionKey: string, contextValue: any): boolean {
    if (!_isObject(expressionValue)) {
        return contextValue === expressionValue;
    }
    const compareKeys = objectKeys(expressionValue);
    if (compareKeys.length !== 1) {
        throw new Error('Invalid expression - too may keys');
    }
    if (isEqualCompareOp(expressionValue)) {
        return contextValue === expressionValue.eq;
    } else if (isNotEqualCompareOp(expressionValue)) {
        return contextValue !== expressionValue.neq;
    } else {
        return evaluateNumberCompareOp(expressionValue, expressionKey, contextValue, compareKeys[0]);
    }
}

function handleAndOp<C extends Context, F extends FunctionsTable<C>, Ignore>
(andExpression: Expression<C, F, Ignore>[], context: C, functionsTable: F, validation: boolean): boolean {
    if (andExpression.length === 0) {
        throw new Error('Invalid expression - and operator must have at least one expression');
    }
    for (const currExpression of andExpression) {
        const result = run<C, F, Ignore>(currExpression, context, functionsTable, validation);
        if (!validation && !result) {
            return false;
        }
    }
    return true;
}

function handleOrOp<C extends Context, F extends FunctionsTable<C>, Ignore>
(orExpression: Expression<C, F, Ignore>[], context: C, functionsTable: F, validation: boolean): boolean {
    if (orExpression.length === 0) {
        throw new Error('Invalid expression - or operator must have at least one expression');
    }
    for (const currExpression of orExpression) {
        const result = run<C, F, Ignore>(currExpression, context, functionsTable, validation);
        if (!validation && result) {
            return true;
        }
    }
    return false;
}

function run<C extends Context, F extends FunctionsTable<C>, Ignore>
(expression: Expression<C, F, Ignore>, context: C, functionsTable: F, validation: boolean): boolean {
    const expressionKeys = objectKeys(expression);
    if (expressionKeys.length !== 1) {
        throw new Error('Invalid expression - too may keys');
    }
    const expressionKey = expressionKeys[0];
    if (isAndCompareOp<C, F, Ignore>(expression)) {
        return handleAndOp<C, F, Ignore>(expression.and, context, functionsTable, validation);
    } else if (isOrCompareOp<C, F, Ignore>(expression)) {
        return handleOrOp<C, F, Ignore>(expression.or, context, functionsTable, validation);
    } else if (isNotCompareOp<C, F, Ignore>(expression)) {
        return !run<C, F, Ignore>(expression.not, context, functionsTable, validation);
    } else if (isFunctionCompareOp<C, F, Ignore>(expression, functionsTable, expressionKey)) {
        return validation ? true : functionsTable[expressionKey](expression[expressionKey], context);
    } else {
        const {value: contextValue, exists} = getFromPath(context, expressionKey);
        if (validation && !exists) {
            throw new Error(`Invalid expression - unknown context key ${expressionKey}`);
        }
        return evaluateCompareOp(expression[expressionKey], expressionKey, contextValue);
    }
}

export const evaluate = <C extends Context, F extends FunctionsTable<C>, Ignore = never>
(expression: Expression<C, F, Ignore>, context: C, functionsTable: F): boolean => {
    return run<C, F, Ignore>(expression, context, functionsTable, false);
};

// TODO ask for non nullable context so we can verify all the context paths exist
// Throws in case of validation error. Does not run functions or compare fields
export const validate = <C extends Context, F extends FunctionsTable<C>, Ignore = never>
(expression: Expression<C, F, Ignore>, validationContext: C, functionsTable: F): void => {
    run<C, F, Ignore>(expression, validationContext, functionsTable, true);
};
