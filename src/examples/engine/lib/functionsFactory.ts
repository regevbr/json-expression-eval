import { userFunc } from './functions/userFunc';
import { counterFunc } from './functions/counterFunc';
import { userRule } from './rules/userRule';

export const functionsTable = {
    user: userFunc,
    maxCount: counterFunc,
};

export const ruleFunctionsTable = {
    userRule,
};
