[![Npm Version](https://img.shields.io/npm/v/json-expression-eval.svg?style=popout)](https://www.npmjs.com/package/json-expression-eval)
[![Build Status](https://travis-ci.org/regevbr/json-expression-eval.svg?branch=master)](https://travis-ci.org/regevbr/json-expression-eval)
[![Coverage Status](https://coveralls.io/repos/github/regevbr/json-expression-eval/badge.svg?branch=master)](https://coveralls.io/github/regevbr/json-expression-eval?branch=master)
[![dependencies Status](https://david-dm.org/regevbr/json-expression-eval/status.svg)](https://david-dm.org/regevbr/json-expression-eval)
[![devDependencies Status](https://david-dm.org/regevbr/json-expression-eval/dev-status.svg)](https://david-dm.org/regevbr/json-expression-eval?type=dev)

# json-expression-eval
A Node.js module that evaluates a json described boolean expression using dynamic functions
## Installation 
```sh
npm install json-expression-eval --save
yarn add json-expression-eval
```
## Usage
 *Please see tests for more usages and example dir for extended and opinionated usage. (under /src)* 
### API
This module enables you to evaluate boolean expressions which are described using a JSON structure and can utilize user defined 'functions'.  
There are 4 types op operators you can use (evaluated in that order of precedence):
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

### Javascript
```javascript
const evaluator = require('json-expression-eval');
const functionsTable = {
	user: (user, context) => {
        return context.userId === user;
    },
	maxCount: (maxCount, context) => {
        return context.times < maxCount;
    }
};
const result = evaluator.evaluate({or:[{user: 'a@b.com'},{not: {and: [{maxCount: 1},{user: 'a2@b.com'}]}}]},{userId:'a@b.com', times: 1},functionsTable);
```
```sh
Output should be 'true'
```
### TypeScript
```typescript
import { evaluate } from 'json-expression-eval';
const functionsTable : FunctionsTable = {
	user: (user :string , context : { userId: string }): boolean => {
        return context.userId === user;
    },
	maxCount: (maxCount: number, context: { times: number }): boolean => {
        return context.times < maxCount;
    }
};
const result = evaluate({or:[{user: 'a@b.com'},{not: {and: [{maxCount: 5},{user: 'a2@b.com'}]}}]},{userId:'a2@b.com', times: 1},functionsTable);
```
```sh
Output should be 'false'
```
## Test 
```sh
npm run test
```
