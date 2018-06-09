"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functionsFactory_1 = require("./functionsFactory");
const index_1 = require("./../../dist/index");
exports.evaluate = (expression, context) => {
    return index_1.evaluate(expression, context, functionsFactory_1.functionsTable);
};
