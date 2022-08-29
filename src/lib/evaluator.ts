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
    PropertyCompareOps, Primitive
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

type WithRef = {
    ref: string
}

const isWithRef = (x: unknown): x is WithRef => Boolean((x as WithRef).ref);

const extractValueOrRef = <C extends Context>(context: C, validation: boolean, valueOrRef: Primitive | WithRef) => {
    if (isWithRef(valueOrRef)) {
        const {value, exists} = getFromPath(context, valueOrRef.ref);
        if (validation && !exists) {
            throw new Error(`Invalid expression - unknown context key ${valueOrRef.ref}`);
        }
        return value;
    } else {
        return valueOrRef;
    }
}

function evaluateCompareOp<C extends Context>(expressionValue: ExtendedCompareOp<any, any, any>, expressionKey: string,
                                              contextValue: any, context: C, validation: boolean)
    : boolean {
    if (!_isObject(expressionValue)) {
        return contextValue === expressionValue;
    }
    const compareKeys = objectKeys(expressionValue);
    if (compareKeys.length !== 1) {
        throw new Error('Invalid expression - too may keys');
    }
    if (isEqualCompareOp(expressionValue)) {
        return contextValue === extractValueOrRef(context, validation, expressionValue.eq);
    } else if (isNotEqualCompareOp(expressionValue)) {
        return contextValue !== extractValueOrRef(context, validation, expressionValue.neq);
    } else if (isInqCompareOp(expressionValue)) {
        return expressionValue.inq.map((value) => extractValueOrRef(context, validation, value))
            .indexOf(contextValue) >= 0;
    } else if (isNinCompareOp(expressionValue)) {
        return expressionValue.nin.map((value) => extractValueOrRef(context, validation, value))
            .indexOf(contextValue) < 0;
    } else if (isRegexCompareOp(expressionValue)) {
        contextStringAssertion(expressionKey, contextValue);
        const regexpValue = extractValueOrRef(context, validation, expressionValue.regexp);
        expressionStringAssertion(expressionKey, regexpValue);
        return Boolean(contextValue.match(new RegExp(regexpValue)));
    } else if (isRegexiCompareOp(expressionValue)) {
        contextStringAssertion(expressionKey, contextValue);
        const regexpiValue = extractValueOrRef(context, validation, expressionValue.regexpi);
        expressionStringAssertion(expressionKey, regexpiValue);
        return Boolean(contextValue.match(new RegExp(regexpiValue, `i`)));
    } else if (isGtCompareOp(expressionValue)) {
        contextNumberAssertion(expressionKey, contextValue);
        const gtValue = extractValueOrRef(context, validation, expressionValue.gt);
        expressionNumberAssertion(expressionKey, gtValue);
        return contextValue > gtValue;
    } else if (isGteCompareOp(expressionValue)) {
        contextNumberAssertion(expressionKey, contextValue);
        const gteValue = extractValueOrRef(context, validation, expressionValue.gte);
        expressionNumberAssertion(expressionKey, gteValue);
        return contextValue >= gteValue;
    } else if (isLteCompareOp(expressionValue)) {
        contextNumberAssertion(expressionKey, contextValue);
        const lteValue = extractValueOrRef(context, validation, expressionValue.lte);
        expressionNumberAssertion(expressionKey, lteValue);
        return contextValue <= lteValue;
    } else if (isLtCompareOp(expressionValue)) {
        contextNumberAssertion(expressionKey, contextValue);
        const ltValue = extractValueOrRef(context, validation, expressionValue.lt);
        expressionNumberAssertion(expressionKey, ltValue);
        return contextValue < ltValue;
    } else if (isBetweenCompareOp(expressionValue)) {
        contextNumberAssertion(expressionKey, contextValue);
        if (expressionValue.between.length !== 2) {
            throw new Error(`Invalid expression - ${expressionKey}.length must be 2`);
        }
        const [lowRaw, highRaw] = expressionValue.between;
        const low = extractValueOrRef(context, validation, lowRaw);
        const high = extractValueOrRef(context, validation, highRaw);
        expressionNumberAssertion(`${expressionKey}[0]`, low);
        expressionNumberAssertion(`${expressionKey}[1]`, high);
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
        return evaluateCompareOp<C>(
            (expression as PropertyCompareOps<C, Ignore>)
                [expressionKey as any as keyof PropertyCompareOps<C, Ignore>] as
                unknown as ExtendedCompareOp<any, any, any>,
            expressionKey, contextValue, context, validation);
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
