import {ExpressionHandler} from '../../index';
import {expectError, expectType} from 'tsd';

type ExpressionFunction = {
    user: (user: string, context: { userId: string },
           runOpts: {validation: boolean, custom: {dryRun: boolean}}) => boolean;
}

type ErroredExpressionFunction = {
    user: (user: string, context: { userId: string },
           runOpts: {validation: boolean, custom: {dummy: boolean}}) => boolean;
}

type Context = {
    timesCounter?: number;
    userId: string,
    nested: {
        value2: number | undefined,
        value: number | null,
    },
}

type BadValidationContext = {
    userId: string;
    nested: {
        value2: number;
        value: number;
    };
}

type Ignore = never;
type CustomEvaluatorFuncRunOptions = {dryRun: boolean};

type TestExpressionEval = ExpressionHandler<Context, ExpressionFunction, Ignore, CustomEvaluatorFuncRunOptions>;

declare const functions: ExpressionFunction;
declare const erroredFunctions: ErroredExpressionFunction;
declare const validationContext: BadValidationContext;
declare const expressionEval: TestExpressionEval;
declare const runOpts: CustomEvaluatorFuncRunOptions;

expectError(expressionEval.validate(validationContext, runOpts));

expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({userId: 5}, functions));
const a = {userId: 'f', timesCounter: 5};
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>(a, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({
    and: [{
        timesCounter: {
            ne: 'sdf',
        },
    }],
}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({and: [], or: []}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({and: [], not: []}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({or: [], not: []}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({or: [], userId: 'dfg'}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({user: {eq: 'sdf'}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({userId: {eq: 5}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({userId: {eq: 'sdf'}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({userId: {neq: 'sdf'}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({user: 5}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({user: 'sdf'}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({userId: 5}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({userId: 'sdf'}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({nested: {value: 5}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({'nested.value': 'sdf'}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({'nested.valu2e': 'sdf'}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({'nested.value': 5}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({timesCounter: {neq: 'sdf'}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>(
    {timesCounter: {neq: {ref:'nested.value333'}}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction, Ignore, CustomEvaluatorFuncRunOptions>(
    {timesCounter: {neq: {op: '+', lhs:5, rhs: {ref:'nested.value333'}}}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>(
    {userId: {inq: [{op: '+', lhs:5, rhs: 4}]}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>(
    {userId: {nin: [{op: '+', lhs:5, rhs: 4}]}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>(
    {userId: {eq: {op: '+', lhs:5, rhs: 4}}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>(
    {userId: {neq: {op: '+', lhs:5, rhs: 4}}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>(
    {userId: {regexp: {op: '+', lhs:5, rhs: 4}}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>(
    {userId: {regexpi: {op: '+', lhs:5, rhs: 4}}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>(
    {timesCounter: {neq: {op: 'dummy', lhs:5, rhs: 6}}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({timesCounter: {neq: {ref:'nested.value'}}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>(
    {timesCounter: {neq: {op: '+', lhs: {ref:'nested.value'}, rhs: 5}}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({timesCounter: {neq: 5}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({timesCounter: {eq: 5}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({timesCounter: {gt: 5}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({timesCounter: {gte: 5}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({timesCounter: {lt: 5}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({timesCounter: {lte: 5}}, functions));

// inq
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>
({timesCounter: {inq: [4, 5, 6]}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>
({userId: {inq: ['a', 'b', 'c']}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({timesCounter: {inq: ['s']}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({userId: {inq: [5]}}, functions));

// nin
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>
({timesCounter: {nin: [4, 5, 6]}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>
({userId: {nin: ['a', 'b', 'c']}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({timesCounter: {nin: ['s']}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({userId: {nin: [5]}}, functions));

// regexp
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>
({userId: {regexp: 'sdf'}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({timesCounter: {regexp: 'sdf'}}, functions));

// regexpi
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>
({userId: {regexpi: 'sdf'}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({timesCounter: {regexpi: 'sdf'}}, functions));

// between
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>
({timesCounter: {between: [4, 5]}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({timesCounter: {between: [4]}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({timesCounter: {between: [4, 5, 6]}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({timesCounter: {userId: [4, 5]}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({timesCounter: {between: []}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({timesCounter: {between: ['s']}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({timesCounter: {between: [4, 5]}}, erroredFunctions));

// exists
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>
({timesCounter: {exists: true}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>
({timesCounter: {exists: false}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>
({userId: {exists: true}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>
({'nested.value': {exists: true}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({timesCounter: {exists: 'true'}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({timesCounter: {exists: 1}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEvaluatorFuncRunOptions>({timesCounter: {exists: null}}, functions));
