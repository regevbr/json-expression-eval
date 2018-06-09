'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const userFunc_1 = require("./functions/userFunc");
const counterFunc_1 = require("./functions/counterFunc");
const functionsTable = {};
exports.functionsTable = functionsTable;
const _addFunction = (description) => {
    if (functionsTable[description.name]) {
        throw new Error(`Function with name ${description.name} already exists`);
    }
    functionsTable[description.name] = description.evaluate;
};
_addFunction(userFunc_1.factory());
_addFunction(counterFunc_1.factory());
