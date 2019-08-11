'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const evaluator_1 = require("./lib/evaluator");
const run = (expr, ctx) => {
    const result = evaluator_1.evaluate(expr, ctx);
    console.log(`Evaluating expression ${JSON.stringify(expr)} using context ${JSON.stringify(ctx)}`);
    console.log(`Result: ${result}`);
};
const context = {
    userId: 'a@b.com',
    times: 3,
};
let expression = {
    user: 'a@b.com',
};
run(expression, context);
expression = {
    and: [
        { user: 'a@b.com' },
        { maxCount: 5 },
    ],
};
run(expression, context);
expression = {
    and: [
        { user: 'a@b.com' },
        { maxCount: 1 },
    ],
};
run(expression, context);
expression = {
    or: [
        { user: 'a@b.com' },
        { maxCount: 6 },
    ],
};
run(expression, context);
expression = {
    or: [
        { not: { user: 'a@b.com' } },
        { maxCount: 1 },
    ],
};
run(expression, context);
expression = {
    or: [
        { times: { lt: 5 } },
        { times: { gte: 10 } },
    ],
};
run(expression, context);
expression = {
    or: [
        { times: 3 },
        { times: { gte: 10 } },
    ],
};
run(expression, context);
//# sourceMappingURL=example.js.map