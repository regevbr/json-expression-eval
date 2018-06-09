'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const desc = {
    name: 'user',
    evaluate: (user, context) => {
        return context.userId === user;
    },
};
exports.factory = () => {
    return desc;
};
