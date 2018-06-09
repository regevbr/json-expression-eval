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
