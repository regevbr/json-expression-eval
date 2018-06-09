'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const userFunc_1 = require("./functions/userFunc");
const counterFunc_1 = require("./functions/counterFunc");
const functionsTable = {
    user: userFunc_1.userFunc,
    maxCount: counterFunc_1.counterFunc,
};
exports.functionsTable = functionsTable;
