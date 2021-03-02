'use strict';

import {evaluate, ExpressionContext, ExpressionFunction} from './lib/evaluator';
import {Expression} from '../';

const run = (expr: Expression<ExpressionContext, ExpressionFunction>, ctx: ExpressionContext) => {
    const result = evaluate(expr, ctx);
    console.log(`Evaluating expression ${JSON.stringify(expr)} using context ${JSON.stringify(ctx)}`);
    console.log(`Result: ${result}`);
};

const context: ExpressionContext = {
    userId: 'a@b.com',
    times: 3,
    nested: {
        value: 5,
        nested2: {
            value: 7,
        },
    },
};

let expression: Expression<ExpressionContext, ExpressionFunction> = {
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
            nested: {
                value: 5,
            },
        },
        {
            nested: {
                value: {
                    gt: 6,
                },
            },
        },
    ],
};

run(expression, context);
