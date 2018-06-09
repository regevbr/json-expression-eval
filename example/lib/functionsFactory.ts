'use strict';

import {Func, FunctionsTable} from "../../dist";
import {ExpressionContext} from "./evaluator";
import {factory as userFuncFactory} from './functions/userFunc';
import {factory as counterFuncFactory} from './functions/counterFunc';

export interface FunctionDescription {
    name: string;
    evaluate: Func<ExpressionContext>;
}

export type FuncFactory = () => FunctionDescription;

const functionsTable: FunctionsTable<ExpressionContext> = {};

const _addFunction = (description: FunctionDescription) : void => {
    if (functionsTable[description.name]) {
        throw new Error(`Function with name ${description.name} already exists`);
    }
    functionsTable[description.name] = description.evaluate;
};

_addFunction(userFuncFactory());
_addFunction(counterFuncFactory());

export { functionsTable };
