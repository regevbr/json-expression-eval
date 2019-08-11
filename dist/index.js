'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
function isAndCompareOp(expression) {
    return Array.isArray(expression.and);
}
function isOrCompareOp(expression) {
    return Array.isArray(expression.or);
}
function isNotCompareOp(expression) {
    return _isObject(expression.not);
}
function isGtCompareOp(op) {
    return op.gt !== undefined;
}
function isGteCompareOp(op) {
    return op.gte !== undefined;
}
function isLteCompareOp(op) {
    return op.lte !== undefined;
}
function isLtCompareOp(op) {
    return op.lt !== undefined;
}
function isEqualCompareOp(op) {
    return op.eq !== undefined;
}
function isNotEqualCompareOp(op) {
    return op.neq !== undefined;
}
const _isObject = (obj) => {
    const type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};
const evaluateCompareOp = (op, key, param) => {
    if (!_isObject(op[key])) {
        return param === op[key];
    }
    const keys = Object.keys(op[key]);
    if (keys.length !== 1) {
        throw new Error('Invalid expression - too may keys');
    }
    if (isGtCompareOp(op[key])) {
        return param > op[key].gt;
    }
    else if (isGteCompareOp(op[key])) {
        return param >= op[key].gte;
    }
    else if (isLteCompareOp(op[key])) {
        return param <= op[key].lte;
    }
    else if (isLtCompareOp(op[key])) {
        return param < op[key].lt;
    }
    else if (isEqualCompareOp(op[key])) {
        return param === op[key].eq;
    }
    else if (isNotEqualCompareOp(op[key])) {
        return param !== op[key].neq;
    }
    throw new Error(`Invalid expression - unknown op ${keys[0]}`);
};
const handleAndOp = (andExpression, context, functionsTable) => {
    if (andExpression.length === 0) {
        throw new Error('Invalid expression - and operator must have at least one expression');
    }
    let result = true;
    andExpression.forEach((currExpression) => {
        const currResult = exports.evaluate(currExpression, context, functionsTable);
        result = result && currResult;
    });
    return result;
};
const handleOrOp = (orExpression, context, functionsTable) => {
    if (orExpression.length === 0) {
        throw new Error('Invalid expression - or operator must have at least one expression');
    }
    let result = false;
    orExpression.forEach((currExpression) => {
        const currResult = exports.evaluate(currExpression, context, functionsTable);
        result = result || currResult;
    });
    return result;
};
exports.evaluate = (expression, context, functionsTable) => {
    const keys = Object.keys(expression);
    if (keys.length !== 1) {
        throw new Error('Invalid expression - too may keys');
    }
    const key = keys[0];
    if (isAndCompareOp(expression)) {
        return handleAndOp(expression.and, context, functionsTable);
    }
    else if (isOrCompareOp(expression)) {
        return handleOrOp(expression.or, context, functionsTable);
    }
    else if (isNotCompareOp(expression)) {
        return !exports.evaluate(expression.not, context, functionsTable);
    }
    else if (key in functionsTable) {
        return functionsTable[key](expression[key], context);
    }
    else if (key in context) {
        return evaluateCompareOp(expression, key, context[key]);
    }
    throw new Error(`Invalid expression - unknown function ${key}`);
};
//# sourceMappingURL=index.js.map