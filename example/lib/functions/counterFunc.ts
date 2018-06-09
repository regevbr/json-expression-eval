'use strict';

import {FuncFactory, FunctionDescription} from "../functionsFactory";

const desc = {
    name: 'maxCount',
    evaluate: (maxCount: number, context: { times: number }): boolean => {
        return context.times < maxCount;
    },
};

export const factory: FuncFactory = (): FunctionDescription => {
    return desc;
};
