import {ExpressionContext, ExpressionFunction, getEvaluator} from './lib/evaluator';
import {Expression, ExpressionParts} from '../..';
import {Moment} from 'moment';
import moment = require('moment');
import {CustomEngineRuleFuncRunOptions} from './lib/evaluator';

const context: ExpressionContext = {
    userId: 'a@b.com',
    date: moment(),
    times: 3,
    nested: {
        value: 5,
        nested2: {
            value: 7,
        },
    },
};

const run = async (expr: Expression<ExpressionContext, ExpressionFunction, Moment, CustomEngineRuleFuncRunOptions>,
                   ctx: ExpressionContext) => {
    const result = await getEvaluator(expression).evaluate(ctx, {dryRun: true});
    console.log(`Evaluating expression ${JSON.stringify(expr)} using context ${JSON.stringify(ctx)}`);
    console.log(`Result: ${result}`);
};

let expression: Expression<ExpressionContext, ExpressionFunction, Moment, CustomEngineRuleFuncRunOptions> = {
    user: 'a@b.com',
};

run(expression, context);

expression = {
    and: [
        {user: 'a@b.com'},
        {maxCount: 5},
    ],
};

run(expression, context);

expression = {
    and: [
        {user: 'a@b.com'},
        {times: {eq:{ref:'nested.value'}}},
    ],
};

run(expression, context);

expression = {
    and: [
        {user: 'a@b.com'},
        {times: {eq:{op:'+', lhs: {ref:'nested.value'}, rhs: 1}}},
    ],
};

run(expression, context);

expression = {
    and: [
        {user: 'a@b.com'},
        {maxCount: 1},
    ],
};

run(expression, context);

expression = {
    or: [
        {user: 'a@b.com'},
        {maxCount: 6},
    ],
};

run(expression, context);

expression = {
    or: [
        {not: {user: 'a@b.com'}},
        {maxCount: 1},
    ],
};

run(expression, context);

expression = {
    or: [
        {times: {lt: 5}},
        {times: {between: [7, 9] as const}},
        {times: {inq: [7, 9]}},
        {userId: {inq: ['a', 'b']}},
        {userId: {nin: ['a', 'b']}},
        {userId: {regexp: '^a'}},
        {userId: {regexpi: '^a'}},
        {times: {gte: 10}},
    ],
};

run(expression, context);

expression = {
    or: [
        {times: 3},
        {times: {gte: 10}},
    ],
};

run(expression, context);

expression = {
    or: [
        {times: 3},
        {
            'nested.value': 5,
        },
        {
            'nested.value': {
                gt: 6,
            },
        },
    ],
};

run(expression, context);

const expressionParts: ExpressionParts<ExpressionContext, ExpressionFunction, { description: string },
    Moment, CustomEngineRuleFuncRunOptions> = {
    'nested.value': {
        isArray: false,
        isFunction: false,
        propertyPath: 'nested.value',
        type: 'number',
        description: 'my desc',
    },
    'nested.nested2.value': {
        isArray: false,
        isFunction: false,
        propertyPath: 'nested.nested2.value',
        type: 'number',
        description: 'my desc',
    },
    times: {
        isArray: false,
        isFunction: false,
        propertyPath: 'times',
        type: 'number',
        description: 'my desc',
    },
    userId: {
        isArray: false,
        isFunction: false,
        propertyPath: 'userId',
        type: 'string',
        description: 'my desc',
    },
    maxCount: {
        isArray: false,
        isFunction: true,
        propertyPath: 'maxCount',
        type: 'number',
        description: 'my desc',
    },
    user: {
        isArray: false,
        isFunction: true,
        propertyPath: 'user',
        type: 'string',
        description: 'my desc',
    },
};
