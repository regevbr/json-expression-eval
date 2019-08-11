'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const functionsFactory_1 = require("./functionsFactory");
const __1 = require("../..");
exports.evaluate = (expression, context) => {
    return __1.evaluate(expression, context, functionsFactory_1.functionsTable);
};
//# sourceMappingURL=evaluator.js.map