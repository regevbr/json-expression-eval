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
    isRegexiCompareOp,
    isExistsCompareOp,
    isWithRef, isMathOp,
    WithRef
} from './typeGuards';
import {
    Context,
    Expression,
    FunctionsTable,
    ExtendedCompareOp,
    ValidationContext,
    PropertyCompareOps, Primitive, MathOp,
    EvaluationResult
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

const extractValueOrRef = <C extends Context>(context: C, validation: boolean, valueOrRef: Primitive | WithRef)
    : Primitive => {
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

const computeValue = <C extends Context>(context: C, validation: boolean,
                                         value: Primitive | WithRef | MathOp<any, any>,
                                         expressionKey: string): Primitive => {
    if (isMathOp(value)) {
        const lhs = extractValueOrRef<C>(context, validation, value.lhs);
        const rhs = extractValueOrRef<C>(context, validation, value.rhs);
        expressionNumberAssertion(expressionKey, lhs);
        expressionNumberAssertion(expressionKey, rhs);
        switch (value.op) {
            case '+':
                return lhs + rhs;
            case '-':
                return lhs - rhs;
            case '*':
                return lhs * rhs;
            case '/':
                return lhs / rhs;
            case '%':
                return lhs % rhs;
            case 'pow':
                return Math.pow(lhs, rhs);
            default:
                throw new Error(`Invalid expression - ${expressionKey} has invalid math operand ${value.op}`);
        }
    }
    return extractValueOrRef(context, validation, value);
}

async function evaluateCompareOp<C extends Context, Ignore>(expressionValue: ExtendedCompareOp<any, any, any>,
                                                            expressionKey: string, contextValue: any,
                                                            context: C, validation: boolean)
    : Promise<boolean> {
    if (!_isObject(expressionValue)) {
        return contextValue === expressionValue;
    }
    const compareKeys = objectKeys(expressionValue);
    if (compareKeys.length !== 1) {
        throw new Error('Invalid expression - too may keys');
    }
    if (isEqualCompareOp(expressionValue)) {
        return contextValue === computeValue(context, validation, expressionValue.eq, expressionKey);
    } else if (isNotEqualCompareOp(expressionValue)) {
        return contextValue !== computeValue(context, validation, expressionValue.neq, expressionKey);
    } else if (isInqCompareOp(expressionValue)) {
        return expressionValue.inq.map((value) => computeValue(context, validation, value, expressionKey))
            .indexOf(contextValue) >= 0;
    } else if (isNinCompareOp(expressionValue)) {
        return expressionValue.nin.map((value) => computeValue(context, validation, value, expressionKey))
            .indexOf(contextValue) < 0;
    } else if (isRegexCompareOp(expressionValue)) {
        contextStringAssertion(expressionKey, contextValue);
        const regexpValue = computeValue(context, validation, expressionValue.regexp, expressionKey);
        expressionStringAssertion(expressionKey, regexpValue);
        return Boolean(new RegExp(regexpValue).exec(contextValue));
    } else if (isRegexiCompareOp(expressionValue)) {
        contextStringAssertion(expressionKey, contextValue);
        const regexpiValue = computeValue(context, validation, expressionValue.regexpi, expressionKey);
        expressionStringAssertion(expressionKey, regexpiValue);
        return Boolean(new RegExp(regexpiValue, `i`).exec(contextValue));
    } else if (isExistsCompareOp(expressionValue)) {
        const shouldExist = expressionValue.exists;
        const doesExist = contextValue !== null && contextValue !== undefined;
        return shouldExist ? doesExist : !doesExist;
    } else if (isGtCompareOp(expressionValue)) {
        contextNumberAssertion(expressionKey, contextValue);
        const gtValue = computeValue(context, validation, expressionValue.gt, expressionKey);
        expressionNumberAssertion(expressionKey, gtValue);
        return contextValue > gtValue;
    } else if (isGteCompareOp(expressionValue)) {
        contextNumberAssertion(expressionKey, contextValue);
        const gteValue = computeValue(context, validation, expressionValue.gte, expressionKey);
        expressionNumberAssertion(expressionKey, gteValue);
        return contextValue >= gteValue;
    } else if (isLteCompareOp(expressionValue)) {
        contextNumberAssertion(expressionKey, contextValue);
        const lteValue = computeValue(context, validation, expressionValue.lte, expressionKey);
        expressionNumberAssertion(expressionKey, lteValue);
        return contextValue <= lteValue;
    } else if (isLtCompareOp(expressionValue)) {
        contextNumberAssertion(expressionKey, contextValue);
        const ltValue = computeValue(context, validation, expressionValue.lt, expressionKey);
        expressionNumberAssertion(expressionKey, ltValue);
        return contextValue < ltValue;
    } else if (isBetweenCompareOp(expressionValue)) {
        contextNumberAssertion(expressionKey, contextValue);
        if (expressionValue.between.length !== 2) {
            throw new Error(`Invalid expression - ${expressionKey}.length must be 2`);
        }
        const [lowRaw, highRaw] = expressionValue.between;
        const low = computeValue(context, validation, lowRaw, expressionKey);
        const high = computeValue(context, validation, highRaw, expressionKey);
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

// Internal type for run result with reason
interface RunResult<C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    Ignore, CustomEvaluatorFuncRunOptions> {
    result: boolean;
    reason: Expression<C, F, Ignore, CustomEvaluatorFuncRunOptions>;
}

async function handleAndOp<C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    Ignore, CustomEvaluatorFuncRunOptions>
(andExpression: Expression<C, F, Ignore, CustomEvaluatorFuncRunOptions>[], context: C, functionsTable: F,
 validation: boolean, runOptions: CustomEvaluatorFuncRunOptions)
    : Promise<RunResult<C, F, Ignore, CustomEvaluatorFuncRunOptions>> {
    if (andExpression.length === 0) {
        throw new Error('Invalid expression - and operator must have at least one expression');
    }
    const reasons: Expression<C, F, Ignore, CustomEvaluatorFuncRunOptions>[] = [];
    for (const currExpression of andExpression) {
        const runResult = await run<C, F, Ignore, CustomEvaluatorFuncRunOptions>(
            currExpression, context, functionsTable, validation, runOptions);
        if (!runResult.result && !validation) {
            // AND fails on first false - return minimal expression that caused failure
            return {result: false, reason: runResult.reason};
        }
        reasons.push(runResult.reason);
    }
    return {
        result: true,
        reason: {and: reasons} as Expression<C, F, Ignore, CustomEvaluatorFuncRunOptions>,
    };
}

async function handleOrOp<C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    Ignore, CustomEvaluatorFuncRunOptions>(
        orExpression: Expression<C, F, Ignore, CustomEvaluatorFuncRunOptions>[],
        context: C, functionsTable: F, validation: boolean, runOptions: CustomEvaluatorFuncRunOptions)
    : Promise<RunResult<C, F, Ignore, CustomEvaluatorFuncRunOptions>> {
    if (orExpression.length === 0) {
        throw new Error('Invalid expression - or operator must have at least one expression');
    }
    const reasons: Expression<C, F, Ignore, CustomEvaluatorFuncRunOptions>[] = [];
    for (const currExpression of orExpression) {
        const runResult = await run<C, F, Ignore, CustomEvaluatorFuncRunOptions>(
            currExpression, context, functionsTable, validation, runOptions);
        if (runResult.result && !validation) {
            // OR succeeds on first true
            return {result: true, reason: runResult.reason};
        }
        reasons.push(runResult.reason);
    }
    return {
        result: false,
        reason: {or: reasons} as Expression<C, F, Ignore, CustomEvaluatorFuncRunOptions>,
    };
}

async function run<C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    Ignore, CustomEvaluatorFuncRunOptions>(
        expression: Expression<C, F, Ignore, CustomEvaluatorFuncRunOptions>, context: C,
        functionsTable: F, validation: boolean, runOptions: CustomEvaluatorFuncRunOptions)
    : Promise<RunResult<C, F, Ignore, CustomEvaluatorFuncRunOptions>> {
    const expressionKeys = objectKeys(expression);
    if (expressionKeys.length !== 1) {
        throw new Error('Invalid expression - too may keys');
    }
    const expressionKey = expressionKeys[0];
    if (isAndCompareOp<C, F, Ignore, CustomEvaluatorFuncRunOptions>(expression)) {
        return handleAndOp<C, F, Ignore, CustomEvaluatorFuncRunOptions>(expression.and,
            context, functionsTable, validation, runOptions);
    } else if (isOrCompareOp<C, F, Ignore, CustomEvaluatorFuncRunOptions>(expression)) {
        return handleOrOp<C, F, Ignore, CustomEvaluatorFuncRunOptions>(expression.or, context,
            functionsTable, validation, runOptions);
    } else if (isNotCompareOp<C, F, Ignore, CustomEvaluatorFuncRunOptions>(expression)) {
        const innerResult = await run<C, F, Ignore, CustomEvaluatorFuncRunOptions>(
            expression.not, context, functionsTable, validation, runOptions);
        if (innerResult.result) {
            // NOT is false because inner was true - use the inner's true reason
            return {
                result: false,
                reason: {not: innerResult.reason} as
                    Expression<C, F, Ignore, CustomEvaluatorFuncRunOptions>,
            };
        }
        // NOT is true because inner was false - use the inner's false reason
        return {
            result: true,
            reason: {not: innerResult.reason} as
                Expression<C, F, Ignore, CustomEvaluatorFuncRunOptions>,
        };
    } else if (isFunctionCompareOp<C, F, Ignore, CustomEvaluatorFuncRunOptions>(expression,
        functionsTable, expressionKey)) {
        const result = await functionsTable[expressionKey](expression[expressionKey], context, {
            custom: runOptions,
            validation,
        });
        if (result) {
            return {result: true, reason: expression};
        }
        return {result: false, reason: expression};
    } else {
        const {value: contextValue, exists} = getFromPath(context, expressionKey);
        if (validation && !exists) {
            throw new Error(`Invalid expression - unknown context key ${expressionKey}`);
        }
        if (!exists) {
            // In evaluation mode, non-existing property returns false
            return {result: false, reason: expression};
        }
        const result = await evaluateCompareOp<C, Ignore>(
            (expression as PropertyCompareOps<C, Ignore>)
                [expressionKey as any as keyof PropertyCompareOps<C, Ignore>] as
                unknown as ExtendedCompareOp<any, any, any>,
            expressionKey, contextValue, context, validation);
        if (result) {
            return {result: true, reason: expression};
        }
        return {result: false, reason: expression};
    }
}

export const evaluate = async <C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    Ignore = never, CustomEvaluatorFuncRunOptions = undefined>(
        expression: Expression<C, F, Ignore, CustomEvaluatorFuncRunOptions>, context: C, functionsTable: F
        , runOptions: CustomEvaluatorFuncRunOptions)
    : Promise<boolean> => {
    const runResult = await run<C, F, Ignore, CustomEvaluatorFuncRunOptions>(expression, context,
        functionsTable, false, runOptions);
    return runResult.result;
};

// Throws in case of validation error. Does not run functions or compare fields
export const validate = async <C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    Ignore = never, CustomEvaluatorFuncRunOptions = undefined>(
        expression: Expression<C, F, Ignore, CustomEvaluatorFuncRunOptions>,
        validationContext: ValidationContext<C, Ignore>, functionsTable: F, runOptions: CustomEvaluatorFuncRunOptions)
    : Promise<void> => {
    await run<C, F, Ignore, CustomEvaluatorFuncRunOptions>(expression,
        validationContext as C, functionsTable, true, runOptions);
};

export const evaluateWithReason = async <C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    Ignore = never, CustomEvaluatorFuncRunOptions = undefined>(
        expression: Expression<C, F, Ignore, CustomEvaluatorFuncRunOptions>, context: C, functionsTable: F
        , runOptions: CustomEvaluatorFuncRunOptions)
    : Promise<EvaluationResult<C, F, Ignore, CustomEvaluatorFuncRunOptions>> => {
    return run<C, F, Ignore, CustomEvaluatorFuncRunOptions>(
        expression, context, functionsTable, false, runOptions);
};