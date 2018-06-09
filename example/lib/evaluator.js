"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functionsFactory_1 = require("./functionsFactory");
const dist_1 = require("../../dist");
exports.evaluate = (expression, context) => {
    return dist_1.evaluate(expression, context, functionsFactory_1.functionsTable);
};
