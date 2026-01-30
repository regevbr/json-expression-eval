[![Npm Version](https://img.shields.io/npm/v/json-expression-eval.svg?style=popout)](https://www.npmjs.com/package/json-expression-eval)
[![node](https://img.shields.io/node/v-lts/json-expression-eval)](https://www.npmjs.com/package/json-expression-eval)
[![Build status](https://github.com/regevbr/json-expression-eval/actions/workflows/ci.yml/badge.svg?branch=master)](https://www.npmjs.com/package/json-expression-eval)
[![Code Coverage](https://qlty.sh/gh/regevbr/projects/json-expression-eval/coverage.svg)](https://qlty.sh/gh/regevbr/projects/json-expression-eval)
[![Maintainability](https://qlty.sh/gh/regevbr/projects/json-expression-eval/maintainability.svg)](https://qlty.sh/gh/regevbr/projects/json-expression-eval)
[![Known Vulnerabilities](https://snyk.io/test/github/regevbr/json-expression-eval/badge.svg?targetFile=package.json)](https://snyk.io/test/github/regevbr/json-expression-eval?targetFile=package.json)

# json-expression-eval (and rule engine)
A Fully typed Node.js module that evaluates a json described boolean expressions using dynamic functions and a given context.
Expressions can also be evaluated in a [`rule engine`](#rule-engine) manner.  

The module is strictly typed, ensuring that passed expressions are 100% valid at compile time.

This module is especially useful if you need to serialize complex expressions / rules (to be saved in a DB for example) 
  
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
import {evaluate, evaluateWithReason, Expression, ExpressionHandler, validate, ValidationContext, EvaluatorFuncRunOptions, EvaluationResult} from 'json-expression-eval';
import {Moment} from 'moment';
import moment = require('moment');

interface IExampleContext {
    userId: string;
    times: number | undefined;
    date: Moment;
    nested: {
        value: number | null;
        value4: number;
        nested2: {
            value2?: number;
            value3: boolean;
        };
    };
}

type IExampleContextIgnore = Moment;

type IExampleCustomEvaluatorFuncRunOptions = {dryRun: boolean};

type IExampleFunctionTable = {
    countRange: ([min, max]: [min: number, max: number], ctx: { times: number | undefined },
                 runOpts: EvaluatorFuncRunOptions<IExampleCustomEvaluatorFuncRunOptions>) => Promise<boolean>;
}

type IExampleExpression = Expression<IExampleContext, IExampleFunctionTable, IExampleContextIgnore, IExampleCustomEvaluatorFuncRunOptions>; // We pass Moment here to avoid TS exhaustion

const context: IExampleContext = {
    userId: 'a@b.com',
    times: 3,
    date: moment(),
    nested: {
        value: null,
        value4: 5,
        nested2: {
            value3: true,
        },
    },
};

// For validation we must provide a full example context
const validationContext: ValidationContext<IExampleContext, IExampleContextIgnore> = {
    userId: 'a@b.com',
    times: 3,
    date: moment(),
    nested: {
        value: 5,
        value4: 6,
        nested2: {
            value2: 6,
            value3: true,
        },
    },
};

const functionsTable: IExampleFunctionTable = {
    countRange: async ([min, max]: [min: number, max: number], ctx: { times: number | undefined },
                       runOpts: EvaluatorFuncRunOptions<IExampleCustomEvaluatorFuncRunOptions>): Promise<boolean> => {
        return ctx.times === undefined ? false : ctx.times >= min && ctx.times < max;
    },
};

const expression: IExampleExpression = {
    or: [
        {
            userId: 'a@b.com',
        },
        {
            times: {
                lte: {
                    op: '+',
                    lhs: {
                        ref: 'nested.value4',
                    },
                    rhs: 2,
                },
            },
        },
        {
            and: [
                {
                    countRange: [2, 6],
                },
                {
                    'nested.nested2.value3': true,
                },
                {
                    times: {
                        lte: {
                            ref: 'nested.value4',
                        },
                    },
                },
            ],
        },
    ],
};

(async () => {
    // Example usage 1
    const handler =
        new ExpressionHandler<IExampleContext, IExampleFunctionTable, IExampleContextIgnore,
            IExampleCustomEvaluatorFuncRunOptions>(expression, functionsTable);
    await handler.validate(validationContext, {dryRun: false}); // Should not throw
    console.log(await handler.evaluate(context, {dryRun: true})); // true

    // Example usage 2
    await validate<IExampleContext, IExampleFunctionTable, IExampleContextIgnore,
        IExampleCustomEvaluatorFuncRunOptions>(expression, validationContext, functionsTable, {dryRun: true}); // Should not throw
    console.log(await evaluate<IExampleContext, IExampleFunctionTable, IExampleContextIgnore, IExampleCustomEvaluatorFuncRunOptions>(expression, context, functionsTable, {dryRun: true})); // true

    // Example usage 3 - evaluateWithReason returns the minimal expression that led to the result
    const resultWithReason = await evaluateWithReason<IExampleContext, IExampleFunctionTable, IExampleContextIgnore, IExampleCustomEvaluatorFuncRunOptions>(expression, context, functionsTable, {dryRun: true});
    console.log(resultWithReason.result); // true
    console.log(JSON.stringify(resultWithReason.reason)); // {"userId":"a@b.com"} - the first matching condition in the OR

    // Using ExpressionHandler
    const handlerResult = await handler.evaluateWithReason(context, {dryRun: true});
    console.log(handlerResult.result); // true
    console.log(JSON.stringify(handlerResult.reason)); // {"userId":"a@b.com"}
})()
```

### evaluateWithReason

The `evaluateWithReason` function evaluates an expression and returns not only the boolean result, but also the minimal sub-expression that led to that result. This is useful for debugging and understanding why an expression evaluated to a specific value.

```typescript
const result: EvaluationResult<...> = await evaluateWithReason(expression, context, functionsTable, runOptions);
// result.result - boolean: the evaluation result
// result.reason - Expression: the minimal expression that caused the result
```

**Behavior:**
- For `or` expressions that evaluate to `true`: returns the first sub-expression that evaluated to `true`
- For `or` expressions that evaluate to `false`: returns the entire `or` with all sub-expressions (all failed)
- For `and` expressions that evaluate to `false`: returns the first sub-expression that evaluated to `false`
- For `and` expressions that evaluate to `true`: returns the entire `and` with all sub-expressions (all passed)
- For `not` expressions: returns the `not` wrapping the reason from the inner expression
- For simple property comparisons and function calls: returns the expression itself

### Expression

There are 4 types of operators you can use (evaluated in that order of precedence):
- `and` - accepts a non-empty list of expressions
- `or` - accepts a non-empty list of expressions
- `not` - accepts another expressions
- `<user defined funcs>` - accepts any type of argument and evaluated by the user defined functions, and the given context (can be async) and run options (i.e. validation + custom defined value).
- `<compare funcs>` - operates on one of the context properties and compares it to a given value.
    - `{property: {op: value}}`
        - available ops:
            - `gt` - >
            - `gte` - >=
            - `lt` - <
            - `lte` - <=
            - `eq` - ===
            - `neq` - !==
            - `regexp: RegExp` - True if matches the compiled regular expression.
            - `regexpi: RegExp` - True if matches the compiled regular expression with the `i` flag set.
            - `nin: any[]` - True if *not* in an array of values. Comparison is done using the `===` operator
            - `inq: any[]` - True if in an array of values. Comparison is done using the `===` operator
            - `between: readonly [number, number] (as const)` - True if the value is between the two specified values: greater than or equal to first value and less than or equal to second value.
            - `exists: boolean` - True if the value is not null or undefined (when `exists: true`), or True if the value is null or undefined (when `exists: false`). Note: Falsy values like `0`, `false`, and `""` are considered as existing.
    - `{property: value}`
        - compares the property to that value (shorthand to the `eq` op, without the option to user math or refs to other properties)

> Nested properties in the context can also be accessed using a dot notation (see example above)

> In each expression level, you can only define 1 operator, and 1 only

The right-hand side of compare (not user defined) functions can be a:
- literal - number/string/boolean (depending on the left-hand side of the function)
- reference to a property (or nested property) in the context.  
  This can be achieved by using `{"ref":"<dot notation path>"}`
- A math operation that can reference properties in the context.  
  The valid operations are `+,-,*,/,%,pow`.  
  This can be achieved by using  
  ```json
  {
    "op": "<+,-,*,/,%,pow>",
    "lhs": {"ref": "<dot notation path>"}, // or a number literal
    "rhs": {"ref": "<dot notation path>"} // or a number literal
  }
  ```
  which will be computed as `<lhs> <op> <rhs>` where lhs is left-hand-side and rhs is right-hand-side. So for example
  ```json
  {
    "op": "/",
    "lhs": 10,
    "rhs": 2
  }
  ```
  will equal `10 / 2 = 5`


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
         "times": { "eq" : { "ref": "nested.preoprty"}}
      },
      {  
         "country": "USA"
      }
   ]
}
```

### Rule Engine

*Please see tests and examples dir for more usages and examples (under /src)* 

```typescript
import {ValidationContext, validateRules, evaluateRules, RulesEngine, Rule, ResolvedConsequence, EngineRuleFuncRunOptions} from 'json-expression-eval';
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

type IExampleCustomEngineRuleFuncRunOptions = {dryRun: boolean};

type IExamplePayload = number;

type IExampleFunctionTable = {
    countRange: ([min, max]: [min: number, max: number], ctx: { times: number | undefined },
                 runOpts: EngineRuleFuncRunOptions<IExampleCustomEngineRuleFuncRunOptions>) => boolean;
}

type IExampleRuleFunctionTable = {
    userRule: (user: string, ctx: IExampleContext,
               runOpts: EngineRuleFuncRunOptions<IExampleCustomEngineRuleFuncRunOptions>) =>
        Promise<void | ResolvedConsequence<IExamplePayload>>;
}

type IExampleRule = Rule<IExamplePayload, IExampleRuleFunctionTable, IExampleContext,
    IExampleFunctionTable, IExampleContextIgnore, IExampleCustomEngineRuleFuncRunOptions>;

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
const validationContext: ValidationContext<IExampleContext, IExampleContextIgnore> = {
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
    countRange: ([min, max]: [min: number, max: number], ctx: { times: number | undefined },
                 runOptions: EngineRuleFuncRunOptions<IExampleCustomEngineRuleFuncRunOptions>): boolean => {
        return ctx.times === undefined ? false : ctx.times >= min && ctx.times < max;
    },
};

const ruleFunctionsTable: IExampleRuleFunctionTable = {
    userRule: async (user: string, ctx: IExampleContext,
                     runOptions: EngineRuleFuncRunOptions<IExampleCustomEngineRuleFuncRunOptions>)
        : Promise<void | ResolvedConsequence<number>> => {
        if (ctx.userId === user) {
            return {
                message: `Username ${user} is not allowed`,
                custom: 543,
            }
        }
    },
};

const rules: IExampleRule[] = [
    {
        condition: {
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
        },
        consequence: {
            message: ['user', {
                ref: 'userId',
            }, 'should not equal a@b.com'],
            custom: 579,
        },
    },
    {
        userRule: 'b@c.com',
    },
];

(async () => {
    // Example usage 1
    const engine = new RulesEngine<IExamplePayload, IExampleContext, IExampleRuleFunctionTable,
        IExampleFunctionTable, IExampleContextIgnore, IExampleCustomEngineRuleFuncRunOptions>(
        functionsTable, ruleFunctionsTable);
    await engine.validate(rules, validationContext, {dryRun: false}); // Should not throw
    console.log(JSON.stringify(await engine.evaluateAll(rules, context, {dryRun: false}))); // [{"message":"user a@b.com should not equal a@b.com","custom":579}]

    // Example usage 2
    await validateRules<IExamplePayload, IExampleContext, IExampleRuleFunctionTable,
        IExampleFunctionTable, IExampleContextIgnore, IExampleCustomEngineRuleFuncRunOptions>(
        rules, validationContext, functionsTable, ruleFunctionsTable, {dryRun: false}); // Should not throw
    console.log(JSON.stringify(await evaluateRules<IExamplePayload, IExampleContext, IExampleRuleFunctionTable,
        IExampleFunctionTable, IExampleContextIgnore, IExampleCustomEngineRuleFuncRunOptions>(rules, context, functionsTable, ruleFunctionsTable, false, {dryRun: false}))); // [{"message":"user a@b.com should not equal a@b.com","custom":579}]
})();
```
