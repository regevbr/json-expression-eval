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
type CustomEngineRuleFuncRunOptions = {dryRun: boolean};

type TestExpressionEval = ExpressionHandler<Context, ExpressionFunction, Ignore, CustomEngineRuleFuncRunOptions>;

declare const functions: ExpressionFunction;
declare const erroredFunctions: ErroredExpressionFunction;
declare const validationContext: BadValidationContext;
declare const expressionEval: TestExpressionEval;
declare const runOpts: CustomEngineRuleFuncRunOptions;

expectError(expressionEval.validate(validationContext, runOpts));

expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({userId: 5}, functions));
const a = {userId: 'f', timesCounter: 5};
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>(a, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({
    and: [{
        timesCounter: {
            ne: 'sdf',
        },
    }],
}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({and: [], or: []}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({and: [], not: []}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({or: [], not: []}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({or: [], userId: 'dfg'}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({user: {eq: 'sdf'}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({userId: {eq: 5}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({userId: {eq: 'sdf'}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({userId: {neq: 'sdf'}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({user: 5}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({user: 'sdf'}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({userId: 5}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({userId: 'sdf'}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({nested: {value: 5}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({'nested.value': 'sdf'}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({'nested.valu2e': 'sdf'}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({'nested.value': 5}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({timesCounter: {neq: 'sdf'}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>(
    {timesCounter: {neq: {ref:'nested.value333'}}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction, Ignore, CustomEngineRuleFuncRunOptions>(
    {timesCounter: {neq: {op: '+', lhs:5, rhs: {ref:'nested.value333'}}}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>(
    {userId: {inq: [{op: '+', lhs:5, rhs: 4}]}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>(
    {userId: {nin: [{op: '+', lhs:5, rhs: 4}]}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>(
    {userId: {eq: {op: '+', lhs:5, rhs: 4}}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>(
    {userId: {neq: {op: '+', lhs:5, rhs: 4}}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>(
    {userId: {regexp: {op: '+', lhs:5, rhs: 4}}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>(
    {userId: {regexpi: {op: '+', lhs:5, rhs: 4}}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>(
    {timesCounter: {neq: {op: 'dummy', lhs:5, rhs: 6}}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({timesCounter: {neq: {ref:'nested.value'}}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>(
    {timesCounter: {neq: {op: '+', lhs: {ref:'nested.value'}, rhs: 5}}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({timesCounter: {neq: 5}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({timesCounter: {eq: 5}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({timesCounter: {gt: 5}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({timesCounter: {gte: 5}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({timesCounter: {lt: 5}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({timesCounter: {lte: 5}}, functions));

// inq
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>
({timesCounter: {inq: [4, 5, 6]}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>
({userId: {inq: ['a', 'b', 'c']}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({timesCounter: {inq: ['s']}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({userId: {inq: [5]}}, functions));

// nin
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>
({timesCounter: {nin: [4, 5, 6]}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>
({userId: {nin: ['a', 'b', 'c']}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({timesCounter: {nin: ['s']}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({userId: {nin: [5]}}, functions));

// regexp
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>
({userId: {regexp: 'sdf'}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({timesCounter: {regexp: 'sdf'}}, functions));

// regexpi
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>
({userId: {regexpi: 'sdf'}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({timesCounter: {regexpi: 'sdf'}}, functions));

// between
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>
({timesCounter: {between: [4, 5]}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({timesCounter: {between: [4]}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({timesCounter: {between: [4, 5, 6]}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({timesCounter: {userId: [4, 5]}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({timesCounter: {between: []}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({timesCounter: {between: ['s']}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction,
    Ignore, CustomEngineRuleFuncRunOptions>({timesCounter: {between: [4, 5]}}, erroredFunctions));
