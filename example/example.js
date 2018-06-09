"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const evaluator_1 = require("./lib/evaluator");
const run = (expression, context) => {
    const result = evaluator_1.evaluate(expression, context);
    console.log(`Evaluating expression ${JSON.stringify(expression)} using context ${JSON.stringify(context)}`);
    console.log(`Result: ${result}`);
};
let context = {
    userId: 'a@b.com',
    times: 3
};
let expression = {
    user: 'a@b.com'
};
run(expression, context);
expression = {
    and: [
        { user: 'a@b.com' },
        { maxCount: 5 },
    ]
};
run(expression, context);
expression = {
    and: [
        { user: 'a@b.com' },
        { maxCount: 1 },
    ]
};
run(expression, context);
expression = {
    or: [
        { user: 'a@b.com' },
        { maxCount: 6 },
    ]
};
run(expression, context);
