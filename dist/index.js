"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("underscore");
function isAndOp(expression) {
    return expression.and !== undefined;
}
function isOrOp(expression) {
    return expression.or !== undefined;
}
function isNotOp(expression) {
    return expression.not !== undefined;
}
exports.evaluate = (expression, context, functionsTable) => {
    const _evaluate = (_expression) => {
        const keys = Object.keys(_expression);
        if (keys.length !== 1) {
            throw new Error('Invalid expression - too may keys');
        }
        const key = keys[0];
        if (isAndOp(_expression)) {
            const andExpression = _expression.and;
            if (andExpression.length === 0) {
                throw new Error('Invalid expression - and operator must have at least one expression');
            }
            let result = true;
            _.each(andExpression, (currExpression) => {
                const currResult = _evaluate(currExpression);
                result = result && currResult;
            });
            return result;
        }
        else if (isOrOp(_expression)) {
            const orExpression = _expression.or;
            if (orExpression.length === 0) {
                throw new Error('Invalid expression - or operator must have at least one expression');
            }
            let result = false;
            _.each(orExpression, (currExpression) => {
                const currResult = _evaluate(currExpression);
                result = result || currResult;
            });
            return result;
        }
        else if (isNotOp(_expression)) {
            const notExpression = _expression.not;
            return !_evaluate(notExpression);
        }
        else if (key in functionsTable) {
            return functionsTable[key](_expression[key], context);
        }
        throw new Error(`Invalid expression - unknown function ${key}`);
    };
    return _evaluate(expression);
};
