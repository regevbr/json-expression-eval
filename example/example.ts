"use strict";

import {evaluate, ExpressionContext} from './lib/evaluator';
import {Expression} from "../dist";

const run = (expression: Expression, context: ExpressionContext) => {
    const result = evaluate(expression, context);
    console.log(`Evaluating expression ${JSON.stringify(expression)} using context ${JSON.stringify(context)}`);
    console.log(`Result: ${result}`);
};

let context: ExpressionContext = {
    userId: 'a@b.com',
    times: 3
};

let expression: Expression = {
   user: 'a@b.com'
};

run(expression, context);

expression = {
    and: [
        { user: 'a@b.com'},
        { maxCount: 5},
    ]
};

run(expression, context);

expression = {
    and: [
        { user: 'a@b.com'},
        { maxCount: 1},
    ]
};

run(expression, context);

expression = {
    or: [
        { user: 'a@b.com'},
        { maxCount: 6},
    ]
};

run(expression, context);

expression = {
    or: [
        {not: { user: 'a@b.com'}},
        { maxCount: 1},
    ]
};

run(expression, context);



