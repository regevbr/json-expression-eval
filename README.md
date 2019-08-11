[![Npm Version](https://img.shields.io/npm/v/json-expression-eval.svg?style=popout)](https://www.npmjs.com/package/json-expression-eval)
[![Build Status](https://travis-ci.org/regevbr/json-expression-eval.svg?branch=master)](https://travis-ci.org/regevbr/json-expression-eval)
[![Test Coverage](https://api.codeclimate.com/v1/badges/64f26f52c548c8d1e010/test_coverage)](https://codeclimate.com/github/regevbr/json-expression-eval/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/64f26f52c548c8d1e010/maintainability)](https://codeclimate.com/github/regevbr/json-expression-eval/maintainability)
[![Known Vulnerabilities](https://snyk.io/test/github/regevbr/json-expression-eval/badge.svg?targetFile=package.json)](https://snyk.io/test/github/regevbr/json-expression-eval?targetFile=package.json)
[![dependencies Status](https://david-dm.org/regevbr/json-expression-eval/status.svg)](https://david-dm.org/regevbr/json-expression-eval)
[![devDependencies Status](https://david-dm.org/regevbr/json-expression-eval/dev-status.svg)](https://david-dm.org/regevbr/json-expression-eval?type=dev)

# json-expression-eval
A Node.js module that evaluates a json described boolean expressions using dynamic functions and a given context.

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

 *Please see tests and examples dir for more usages and example (under /src)* 

```typescript
import { Expression, evaluate } from 'json-expression-eval';

interface IExampleContext {
  userId: string;
  times: number;
}

const exampleContext: IExampleContext = {
  userId: 'a2@b.com',
  times: 5,
};

const functionsTable = {
  countRange: ([min, max]: [number, number], context: IExampleContext): boolean => {
    return context.times >= min && context.times < max;
  },
};

const expression: Expression<IExampleContext, typeof functionsTable> = {
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
          userId: 'a2@b.com',
        },
      ],
    },
  ],
};
console.log(evaluate(expression, exampleContext, functionsTable)); // true
```

### Expression

There are 4 types of operators you can use (evaluated in that order of precedence):
- `and` - accepts a non empty list of operators
- `or` - accepts a non empty list of operators
- `not` - accepts another operator
- `<user defined funcs>` - accepts any type of argument and evaluated by the user defined functions and given context.
- `<compare funcs>` - operates on one of the context properties and compare it to a given value.
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
