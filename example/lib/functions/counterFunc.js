'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const desc = {
    name: 'maxCount',
    evaluate: (maxCount, context) => {
        return context.times < maxCount;
    },
};
exports.factory = () => {
    return desc;
};
