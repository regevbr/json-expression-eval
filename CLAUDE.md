# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

Run a single test:
```sh
yarn test:unit --grep "test name pattern"
```

## Architecture

### Two Evaluation Systems

1. **Expression Evaluator** (`src/lib/evaluator.ts`): Evaluates boolean expressions against a context
   - `evaluate()` - Returns boolean result
   - `evaluateWithReason()` - Returns result plus minimal expression that caused it
   - `validate()` - Validates expression structure against a full context

2. **Rule Engine** (`src/lib/engine.ts`): Evaluates rules with conditions and consequences
   - Rules have a condition (expression) and consequence (message + custom payload)
   - Can also use rule functions that combine condition checking and consequence in one

### Type System (Critical)

The type system uses `ts-toolbelt` for advanced type manipulation. Generic parameters follow this pattern:
```typescript
<Context, FunctionsTable, Ignore, CustomRunOptions>
```

- **Context**: The object being evaluated against
- **FunctionsTable**: Custom functions available in expressions
- **Ignore**: Types to exclude from path extraction (e.g., `Moment`) to avoid TypeScript exhaustion
- **CustomRunOptions**: User-defined options passed to functions

Key types in `src/types/`:
- `Expression` - Union type of all valid expression forms (and/or/not/property comparisons/functions)
- `ValidationContext` - Context with all optional properties required (for validation)
- `EvaluationResult` - Result of `evaluateWithReason()` with boolean and minimal expression

### Expression Operators

Logical: `and`, `or`, `not`
Comparison: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `between`, `inq`, `nin`, `regexp`, `regexpi`, `exists`

Right-hand side can be: literal value, `{ref: "path"}` to reference context, or math operation `{op, lhs, rhs}`.

## Code Style

- 4-space indentation, single quotes, semicolons required
- Lines ~140 characters max
- 100% code coverage required
- Type tests use TSD in `src/test/types/`

## Node.js Support

Supports Node.js ^20, ^22, or ^24