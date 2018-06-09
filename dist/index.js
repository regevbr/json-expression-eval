"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("underscore");
function isAndOp(expression) {
    return expression.and !== undefined;
}
function isOrOp(expression) {
    return expression.or !== undefined;
}
function isNotOp(expression) {
    return expression.not !== undefined;
}
exports.evaluate = function (expression, context, functionsTable) {
    var _evaluate = function (_expression) {
        var keys = Object.keys(_expression);
        if (keys.length !== 1) {
            throw new Error('Invalid expression - too may keys');
        }
        var key = keys[0];
        if (isAndOp(_expression)) {
            var andExpression = _expression.and;
            if (andExpression.length === 0) {
                throw new Error('Invalid expression - and operator must have at least one expression');
            }
            var result_1 = true;
            _.each(andExpression, function (currExpression) {
                var currResult = _evaluate(currExpression);
                result_1 = result_1 && currResult;
            });
            return result_1;
        }
        else if (isOrOp(_expression)) {
            var orExpression = _expression.or;
            if (orExpression.length === 0) {
                throw new Error('Invalid expression - or operator must have at least one expression');
            }
            var result_2 = false;
            _.each(orExpression, function (currExpression) {
                var currResult = _evaluate(currExpression);
                result_2 = result_2 || currResult;
            });
            return result_2;
        }
        else if (isNotOp(_expression)) {
            var notExpression = _expression.not;
            return !_evaluate(notExpression);
        }
        else if (key in functionsTable) {
            return functionsTable[key](_expression[key], context);
        }
        throw new Error("Invalid expression - unknown function " + key);
    };
    return _evaluate(expression);
};
