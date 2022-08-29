import {ExpressionHandler} from '../../index';
import {expectError, expectType} from 'tsd';

type ExpressionFunction = {
    user: (user: string, context: { userId: string }) => boolean;
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

type TestExpressionEval = ExpressionHandler<Context, ExpressionFunction>;

declare const functions: ExpressionFunction;
declare const validationContext: BadValidationContext;
declare const expressionEval: TestExpressionEval;

expectError(expressionEval.validate(validationContext));

expectError(new ExpressionHandler<Context, ExpressionFunction>({}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>({userId: 5}, functions));
const a = {userId: 'f', timesCounter: 5};
expectError(new ExpressionHandler<Context, ExpressionFunction>(a, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>({
    and: [{
        timesCounter: {
            ne: 'sdf',
        },
    }],
}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>({and: [], or: []}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>({and: [], not: []}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>({or: [], not: []}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>({or: [], userId: 'dfg'}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>({user: {eq: 'sdf'}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>({userId: {eq: 5}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction>({userId: {eq: 'sdf'}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction>({userId: {neq: 'sdf'}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>({user: 5}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction>({user: 'sdf'}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>({userId: 5}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction>({userId: 'sdf'}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>({nested: {value: 5}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>({'nested.value': 'sdf'}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction>({'nested.value': 5}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>({timesCounter: {neq: 'sdf'}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>(
    {timesCounter: {neq: {ref:'nested.value333'}}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction>({timesCounter: {neq: {ref:'nested.value'}}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction>({timesCounter: {neq: 5}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction>({timesCounter: {eq: 5}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction>({timesCounter: {gt: 5}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction>({timesCounter: {gte: 5}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction>({timesCounter: {lt: 5}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction>({timesCounter: {lte: 5}}, functions));

// inq
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction>
({timesCounter: {inq: [4, 5, 6]}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction>
({userId: {inq: ['a', 'b', 'c']}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>({timesCounter: {inq: ['s']}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>({userId: {inq: [5]}}, functions));

// nin
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction>
({timesCounter: {nin: [4, 5, 6]}}, functions));
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction>
({userId: {nin: ['a', 'b', 'c']}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>({timesCounter: {nin: ['s']}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>({userId: {nin: [5]}}, functions));

// regexp
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction>
({userId: {regexp: 'sdf'}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>({timesCounter: {regexp: 'sdf'}}, functions));

// regexpi
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction>
({userId: {regexpi: 'sdf'}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>({timesCounter: {regexpi: 'sdf'}}, functions));

// between
expectType<TestExpressionEval>(new ExpressionHandler<Context, ExpressionFunction>
({timesCounter: {between: [4, 5]}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>({timesCounter: {between: [4]}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>({timesCounter: {between: [4, 5, 6]}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>({timesCounter: {userId: [4, 5]}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>({timesCounter: {between: []}}, functions));
expectError(new ExpressionHandler<Context, ExpressionFunction>({timesCounter: {between: ['s']}}, functions));
