'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const functionsDir = path.join(__dirname, '/functions');
const functionsTable = {};
exports.functionsTable = functionsTable;
fs.readdirSync(functionsDir).forEach((file) => {
    if (file.endsWith('.js')) {
        const data = require(path.join(functionsDir, file)).factory;
        const description = data();
        if (functionsTable[description.name]) {
            throw new Error(`Function with name ${description.name} already exists`);
        }
        functionsTable[description.name] = description.evaluate;
    }
});
