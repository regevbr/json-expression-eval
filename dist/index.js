"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isGtOp(op, key) {
    return op[key].gt !== undefined;
}
function isGteOp(op, key) {
    return op[key].gte !== undefined;
}
function isLteOp(op, key) {
    return op[key].lte !== undefined;
}
function isLtOp(op, key) {
    return op[key].lt !== undefined;
}
function isEqOp(op, key) {
    return op[key].eq !== undefined;
}
function isNeqOp(op, key) {
    return op[key].neq !== undefined;
}
function isAndOp(expression) {
    return expression.and !== undefined;
}
function isOrOp(expression) {
    return expression.or !== undefined;
}
function isNotOp(expression) {
    return expression.not !== undefined;
}
function isFuncOp(expression, key, functionsTable) {
    return key in functionsTable;
}
const _isObject = (obj) => {
    const type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};
const _evaluateCompareOp = (op, key, param) => {
    if (!_isObject(op[key])) {
        return param === op[key];
    }
    const keys = Object.keys(op[key]);
    if (keys.length !== 1) {
        throw new Error('Invalid expression - too may keys');
    }
    if (isGtOp(op, key)) {
        return param > op[key].gt;
    }
    else if (isGteOp(op, key)) {
        return param >= op[key].gte;
    }
    else if (isLteOp(op, key)) {
        return param <= op[key].lte;
    }
    else if (isLtOp(op, key)) {
        return param < op[key].lt;
    }
    else if (isEqOp(op, key)) {
        return param === op[key].eq;
    }
    else if (isNeqOp(op, key)) {
        return param !== op[key].neq;
    }
    throw new Error(`Invalid expression - unknown op ${keys[0]}`);
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
        else if (isFuncOp(_expression, key, functionsTable)) {
            return functionsTable[key](_expression[key], context);
        }
        else if (key in context) {
            return _evaluateCompareOp(_expression, key, context[key]);
        }
        throw new Error(`Invalid expression - unknown function ${key}`);
    };
    return _evaluate(expression);
};
