'use strict';

import * as fs from 'fs';
import * as path from 'path';
import {Func, FunctionsTable} from "../../dist";

export interface FunctionDescription {
    name: string;
    evaluate: Func;
}

export type FuncFactory = () => FunctionDescription;

const functionsDir = path.join(__dirname, '/functions');

const functionsTable: FunctionsTable = {};

fs.readdirSync(functionsDir).forEach((file) => {
  if (file.endsWith('.js')) {
    const data = require(path.join(functionsDir, file)).factory as FuncFactory;
    const description = data();
    if (functionsTable[description.name]) {
      throw new Error(`Function with name ${description.name} already exists`);
    }
    functionsTable[description.name] = description.evaluate;
  }
});

export { functionsTable };
