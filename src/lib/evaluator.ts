import {
    isAndCompareOp,
    isEqualCompareOp,
    isBetweenCompareOp,
    isGtCompareOp,
    isGteCompareOp,
    isLtCompareOp,
    isLteCompareOp,
    isNotCompareOp,
    isNotEqualCompareOp,
    isOrCompareOp,
    _isObject,
    isFunctionCompareOp,
    isInqCompareOp,
    isNinCompareOp,
    isRegexCompareOp,
    isRegexiCompareOp
} from './typeGuards';
import {
    Context,
    Expression,
    FunctionsTable,
    ExtendedCompareOp,
    ValidationContext,
    PropertyCompareOps
} from '../types';
import {
    assertUnreachable,
    objectKeys,
    getFromPath,
    contextNumberAssertion,
    contextStringAssertion,
    expressionStringAssertion,
    expressionNumberAssertion
} from './helpers';


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
    } else if (isInqCompareOp(expressionValue)) {
        return expressionValue.inq.indexOf(contextValue) >= 0;
    } else if (isNinCompareOp(expressionValue)) {
        return expressionValue.nin.indexOf(contextValue) < 0;
    } else if (isRegexCompareOp(expressionValue)) {
        contextStringAssertion(expressionKey, contextValue);
        expressionStringAssertion(expressionKey, expressionValue.regexp);
        return Boolean(contextValue.match(new RegExp(expressionValue.regexp)));
    } else if (isRegexiCompareOp(expressionValue)) {
        contextStringAssertion(expressionKey, contextValue);
        expressionStringAssertion(expressionKey, expressionValue.regexpi);
        return Boolean(contextValue.match(new RegExp(expressionValue.regexpi, `i`)));
    } else if (isGtCompareOp(expressionValue)) {
        contextNumberAssertion(expressionKey, contextValue);
        expressionNumberAssertion(expressionKey, expressionValue.gt);
        return contextValue > expressionValue.gt;
    } else if (isGteCompareOp(expressionValue)) {
        contextNumberAssertion(expressionKey, contextValue);
        expressionNumberAssertion(expressionKey, expressionValue.gte);
        return contextValue >= expressionValue.gte;
    } else if (isLteCompareOp(expressionValue)) {
        contextNumberAssertion(expressionKey, contextValue);
        expressionNumberAssertion(expressionKey, expressionValue.lte);
        return contextValue <= expressionValue.lte;
    } else if (isLtCompareOp(expressionValue)) {
        contextNumberAssertion(expressionKey, contextValue);
        expressionNumberAssertion(expressionKey, expressionValue.lt);
        return contextValue < expressionValue.lt;
    } else if (isBetweenCompareOp(expressionValue)) {
        contextNumberAssertion(expressionKey, contextValue);
        if (expressionValue.between.length !== 2) {
            throw new Error(`Invalid expression - ${expressionKey}.length must be 2`);
        }
        expressionValue.between.forEach((value, ind) => {
            expressionNumberAssertion(`${expressionKey}[${ind}]`, value);
        });
        const [low, high] = expressionValue.between;
        if (low > high) {
            throw new Error(`Invalid expression - ${expressionKey} first value is higher than second value`);
        }
        return contextValue >= low && contextValue <= high;
    } else {
        return assertUnreachable(expressionValue, `Invalid expression - unknown op ${compareKeys[0]}`);
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
        return evaluateCompareOp(
            (expression as PropertyCompareOps<C, Ignore>)
                [expressionKey as any as keyof PropertyCompareOps<C, Ignore>] as ExtendedCompareOp,
            expressionKey, contextValue);
    }
}

export const evaluate = <C extends Context, F extends FunctionsTable<C>, Ignore = never>
(expression: Expression<C, F, Ignore>, context: C, functionsTable: F): boolean => {
    return run<C, F, Ignore>(expression, context, functionsTable, false);
};

// Throws in case of validation error. Does not run functions or compare fields
export const validate = <C extends Context, F extends FunctionsTable<C>, Ignore = never>
(expression: Expression<C, F, Ignore>, validationContext: ValidationContext<C, Ignore>, functionsTable: F): void => {
    run<C, F, Ignore>(expression, validationContext as C, functionsTable, true);
};
