'use strict';

import {FuncFactory, FunctionDescription} from "../functionsFactory";

const desc = {
    name: 'user',
    evaluate: (user: string, context: { userId: string }): boolean => {
        return context.userId === user;
    },
};

export const factory: FuncFactory = (): FunctionDescription => {
    return desc;
};
