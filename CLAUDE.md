# json-expression-eval

A fully typed Node.js module that evaluates JSON-described boolean expressions using dynamic functions and a given context.

## Build & Test Commands

- `yarn install` - Install dependencies
- `yarn build` - Lint and compile TypeScript
- `yarn compile` - Compile TypeScript only
- `yarn test` - Run linting, type tests, and coverage tests
- `yarn test:unit` - Run unit tests only
- `yarn test:cover` - Run unit tests with coverage
- `yarn test:tsd` - Run TypeScript definition tests
- `yarn lint` - Run TSLint
- `yarn ci` - Full CI pipeline (lint, compile, type tests, coverage)

## Project Structure

- `src/lib/evaluator.ts` - Core expression evaluation logic (`evaluate`, `evaluateWithReason`, `validate`)
- `src/lib/engine.ts` - Rule engine evaluation (`evaluateRules`, `validateRules`)
- `src/lib/expressionHandler.ts` - `ExpressionHandler` class wrapper
- `src/lib/rulesEngine.ts` - `RulesEngine` class wrapper
- `src/types/` - TypeScript type definitions
- `src/test/` - Unit tests (Mocha/Chai)
- `src/test/types/` - TSD type definition tests

## Code Style

- TypeScript with strict typing
- TSLint for linting (`tslint.json`)
- 4-space indentation
- Single quotes for strings
- Semicolons required
- Lines should not exceed ~140 characters
- Generic type parameters follow pattern: `<Context, FunctionsTable, Ignore, CustomRunOptions>`

## Testing

- Mocha test framework with Chai assertions
- Tests in `src/test/*.spec.ts`
- 100% code coverage required
- Type tests use TSD in `src/test/types/`

## Key Concepts

- **Expression**: JSON object describing boolean logic with `and`, `or`, `not`, property comparisons, and custom functions
- **Context**: Object containing values to evaluate against
- **FunctionsTable**: Custom async/sync functions for expression evaluation
- **ValidationContext**: Full context with all optional properties filled (for validation)
- **Ignore**: Types to exclude from path extraction (e.g., Moment)

## Node.js Support

Supports Node.js ^20, ^22, or ^24 (no Node 18 support as of v9.0.0)
