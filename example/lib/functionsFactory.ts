'use strict';

import {FunctionsTable} from "../../dist";
import {ExpressionContext} from "./evaluator";
import {userFunc} from './functions/userFunc';
import {counterFunc} from './functions/counterFunc';


const functionsTable: FunctionsTable<ExpressionContext> = {
    user: userFunc,
    maxCount: counterFunc,
};

export {functionsTable};
