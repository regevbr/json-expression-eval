'use strict';

import {ExpressionContext, ExpressionFunction, getEvaluator} from './lib/evaluator';
import {Expression, ExpressionParts} from '../';
import {Moment} from 'moment';
import moment = require('moment');

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

const run = (expr: Expression<ExpressionContext, ExpressionFunction, Moment>, ctx: ExpressionContext) => {
    const result = getEvaluator(expression).evaluate(ctx);
    console.log(`Evaluating expression ${JSON.stringify(expr)} using context ${JSON.stringify(ctx)}`);
    console.log(`Result: ${result}`);
};

let expression: Expression<ExpressionContext, ExpressionFunction, Moment> = {
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

const expressionParts: ExpressionParts<ExpressionContext, ExpressionFunction, { description: string }, Moment> = {
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
