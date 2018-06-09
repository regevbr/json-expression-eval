[![Build Status](https://travis-ci.org/regevbr/json-expression-eval.svg?branch=master)](https://travis-ci.org/regevbr/json-expression-eval)
[![Coverage Status](https://coveralls.io/repos/github/regevbr/json-expression-eval/badge.svg?branch=master)](https://coveralls.io/github/regevbr/json-expression-eval?branch=master)

# json-expression-eval
A Node.js module that evaluates a json described boolean expression using dynamic functions
## Installation 
```sh
npm install json-expression-eval --save
yarn add json-expression-eval
```
## Usage
### Javascript
```javascript
var evaluator = require('json-expression-eval');
var result = evaluator.evaluate({and:[{user: 'a@b.com'}]},{userId:'a@b.com'});
```
```sh
Output should be 'true'
```
### TypeScript
```typescript
import { evaluate } from 'json-expression-eval';
console.log(evaluate({and:[{user: 'a@b.com'}]},{userId:'a@b.com'});)

```
```sh
Output should be 'true'
```
## Test 
```sh
npm run test
```
