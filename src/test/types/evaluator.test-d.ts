import {ExpressionEval} from '../../index';
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

type TestExpressionEval = ExpressionEval<Context, ExpressionFunction>;

declare const functions: ExpressionFunction;
declare const validationContext: BadValidationContext;
declare const expressionEval: TestExpressionEval;

expectError(expressionEval.validate(validationContext));

expectError(new ExpressionEval<Context, ExpressionFunction>({}, functions));
expectError(new ExpressionEval<Context, ExpressionFunction>({userId: 5}, functions));
const a = {userId: 'f', timesCounter: 5};
expectError(new ExpressionEval<Context, ExpressionFunction>(a, functions));
expectError(new ExpressionEval<Context, ExpressionFunction>({
    and: [{
        timesCounter: {
            ne: 'sdf',
        },
    }],
}, functions));
expectError(new ExpressionEval<Context, ExpressionFunction>({and: [], or: []}, functions));
expectError(new ExpressionEval<Context, ExpressionFunction>({and: [], not: []}, functions));
expectError(new ExpressionEval<Context, ExpressionFunction>({or: [], not: []}, functions));
expectError(new ExpressionEval<Context, ExpressionFunction>({or: [], userId: 'dfg'}, functions));
expectError(new ExpressionEval<Context, ExpressionFunction>({user: {eq: 'sdf'}}, functions));
expectError(new ExpressionEval<Context, ExpressionFunction>({userId: {eq: 5}}, functions));
expectType<TestExpressionEval>(new ExpressionEval<Context, ExpressionFunction>({userId: {eq: 'sdf'}}, functions));
expectType<TestExpressionEval>(new ExpressionEval<Context, ExpressionFunction>({userId: {neq: 'sdf'}}, functions));
expectError(new ExpressionEval<Context, ExpressionFunction>({user: 5}, functions));
expectType<TestExpressionEval>(new ExpressionEval<Context, ExpressionFunction>({user: 'sdf'}, functions));
expectError(new ExpressionEval<Context, ExpressionFunction>({userId: 5}, functions));
expectType<TestExpressionEval>(new ExpressionEval<Context, ExpressionFunction>({userId: 'sdf'}, functions));
expectError(new ExpressionEval<Context, ExpressionFunction>({nested: {value: 5}}, functions));
expectError(new ExpressionEval<Context, ExpressionFunction>({'nested.value': 'sdf'}, functions));
expectType<TestExpressionEval>(new ExpressionEval<Context, ExpressionFunction>({'nested.value': 5}, functions));
expectError(new ExpressionEval<Context, ExpressionFunction>({timesCounter: {neq: 'sdf'}}, functions));
expectType<TestExpressionEval>(new ExpressionEval<Context, ExpressionFunction>({timesCounter: {neq: 5}}, functions));
expectType<TestExpressionEval>(new ExpressionEval<Context, ExpressionFunction>({timesCounter: {eq: 5}}, functions));
expectType<TestExpressionEval>(new ExpressionEval<Context, ExpressionFunction>({timesCounter: {gt: 5}}, functions));
expectType<TestExpressionEval>(new ExpressionEval<Context, ExpressionFunction>({timesCounter: {gte: 5}}, functions));
expectType<TestExpressionEval>(new ExpressionEval<Context, ExpressionFunction>({timesCounter: {lt: 5}}, functions));
expectType<TestExpressionEval>(new ExpressionEval<Context, ExpressionFunction>({timesCounter: {lte: 5}}, functions));
