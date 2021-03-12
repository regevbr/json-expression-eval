[![Npm Version](https://img.shields.io/npm/v/json-expression-eval.svg?style=popout)](https://www.npmjs.com/package/json-expression-eval)
![node](https://img.shields.io/node/v-lts/json-expression-eval)
[![Build Status](https://travis-ci.org/regevbr/json-expression-eval.svg?branch=master)](https://travis-ci.org/regevbr/json-expression-eval)
[![Test Coverage](https://api.codeclimate.com/v1/badges/5cc9e9fe4871a315f2aa/test_coverage)](https://codeclimate.com/github/regevbr/json-expression-eval/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/5cc9e9fe4871a315f2aa/maintainability)](https://codeclimate.com/github/regevbr/json-expression-eval/maintainability)
[![Known Vulnerabilities](https://snyk.io/test/github/regevbr/json-expression-eval/badge.svg?targetFile=package.json)](https://snyk.io/test/github/regevbr/json-expression-eval?targetFile=package.json)
[![dependencies Status](https://david-dm.org/regevbr/json-expression-eval/status.svg)](https://david-dm.org/regevbr/json-expression-eval)
[![devDependencies Status](https://david-dm.org/regevbr/json-expression-eval/dev-status.svg)](https://david-dm.org/regevbr/json-expression-eval?type=dev)

# json-expression-eval
A Fully typed Node.js module that evaluates a json described boolean expressions using dynamic functions and a given context.

The module is strictly typed, ensuring that passed expressions are 100% valid at compile time.

This module is especially useful if you need to serialize complex expressions (to be saved in DB for example) 
  
## Installation 
```sh
npm install json-expression-eval
```
Or
```sh
yarn add json-expression-eval
```

## Usage

 *Please see tests and examples dir for more usages and examples (under /src)* 

```typescript
import {evaluate, Expression, ExpressionHandler, validate, ValidationContext} from 'json-expression-eval';
import {Moment} from 'moment';
import moment = require('moment');

interface IExampleContext {
    userId: string;
    times: number | undefined;
    date: Moment;
    nested: {
        value: number | null;
        nested2: {
            value2?: number;
            value3: boolean;
        };
    };
}

type IExampleContextIgnore = Moment;

type IExampleFunctionTable = {
    countRange: ([min, max]: [min: number, max: number], ctx: { times: number | undefined }) => boolean;
}

type IExampleExpression = Expression<IExampleContext, IExampleFunctionTable, IExampleContextIgnore>; // We pass Moment here to avoid TS exhaustion

const context: IExampleContext = {
    userId: 'a@b.com',
    times: 3,
    date: moment(),
    nested: {
        value: null,
        nested2: {
            value3: true,
        },
    },
};

// For validation we must provide a full example context
const validationContext: ValidationContext<IExampleContext, Moment> = {
    userId: 'a@b.com',
    times: 3,
    date: moment(),
    nested: {
        value: 5,
        nested2: {
            value2: 6,
            value3: true,
        },
    },
};

const functionsTable: IExampleFunctionTable = {
    countRange: ([min, max]: [min: number, max: number], ctx: { times: number | undefined }): boolean => {
        return ctx.times === undefined ? false : ctx.times >= min && ctx.times < max;
    },
};

const expression: IExampleExpression = {
    or: [
        {
            userId: 'a@b.com',
        },
        {
            and: [
                {
                    countRange: [2, 6],
                },
                {
                    'nested.nested2.value3': true,
                },
            ],
        },
    ],
};

// Example usage 1
const handler =
    new ExpressionHandler<IExampleContext, IExampleFunctionTable, IExampleContextIgnore>(expression, functionsTable);
handler.validate(validationContext); // Should not throw
console.log(handler.evaluate(context)); // true

// Example usage 2
validate<IExampleContext, IExampleFunctionTable, IExampleContextIgnore>(expression, validationContext, functionsTable); // Should not throw
console.log(evaluate<IExampleContext, IExampleFunctionTable, IExampleContextIgnore>(expression, context, functionsTable)); // true
```

### Expression

There are 4 types of operators you can use (evaluated in that order of precedence):
- `and` - accepts a non-empty list of expressions
- `or` - accepts a non-empty list of expressions
- `not` - accepts another expressions
- `<user defined funcs>` - accepts any type of argument and evaluated by the user defined functions and the given context.
- `<compare funcs>` - operates on one of the context properties and compares it to a given value.
    - `{property: {op: value}}`
        - available ops:
            - `gt` - >
            - `gte` - >=
            - `lt` - <
            - `lte` - <=
            - `eq` - ===
            - `neq` - !==
    - `{property: value}`
        - compares the property to that value (shorthand to the `eq` op)
> Nested properties in the context can also be accessed using a dot notation (see example above)
> In each expression level, you can only define 1 operator, and 1 only

Example expressions, assuming we have the `user` and `maxCount` user defined functions in place can be:
```json
{  
   "or":[  
      {  
         "not":{  
            "user":"a@b.com"
         }
      },
      {  
         "maxCount":1
      },
      {  
         "times": { "eq" : 5}
      },
      {  
         "country": "USA"
      }
   ]
}
```
