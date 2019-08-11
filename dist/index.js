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
const _evaluateCompareOp = (op, key, param) => {
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
exports.evaluate = (expression, context, functionsTable) => {
    const _evaluate = (_expression) => {
        const keys = Object.keys(_expression);
        if (keys.length !== 1) {
            throw new Error('Invalid expression - too may keys');
        }
        const key = keys[0];
        if (isAndCompareOp(_expression)) {
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
        else if (isOrCompareOp(_expression)) {
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
        else if (isNotCompareOp(_expression)) {
            const notExpression = _expression.not;
            return !_evaluate(notExpression);
        }
        else if (key in functionsTable) {
            return functionsTable[key](_expression[key], context);
        }
        else if (key in context) {
            return _evaluateCompareOp(_expression, key, context[key]);
        }
        throw new Error(`Invalid expression - unknown function ${key}`);
    };
    return _evaluate(expression);
};
//# sourceMappingURL=index.js.map