"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isAndOp(expression) {
    return expression.and !== undefined;
}
function isOrOp(expression) {
    return expression.or !== undefined;
}
function isNotOp(expression) {
    return expression.not !== undefined;
}
const _isObject = (obj) => {
    const type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};
const _evaluateCompareOp = (op, param) => {
    if (!_isObject(op)) {
        return param === op;
    }
    const keys = Object.keys(op);
    if (keys.length !== 1) {
        throw new Error('Invalid expression - too may keys');
    }
    const key = keys[0];
    const value = op[key];
    switch (key) {
        case 'gt':
            return param > value;
        case 'gte':
            return param >= value;
        case 'lt':
            return param < value;
        case 'lte':
            return param <= value;
        case 'eq':
            return param === value;
        case 'neq':
            return param !== value;
    }
    throw new Error(`Invalid expression - unknown op ${key}`);
};
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
            andExpression.forEach((currExpression) => {
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
            orExpression.forEach((currExpression) => {
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
        else if (key in context) {
            return _evaluateCompareOp(_expression[key], context[key]);
        }
        throw new Error(`Invalid expression - unknown function ${key}`);
    };
    return _evaluate(expression);
};
