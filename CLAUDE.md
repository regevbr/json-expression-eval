# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Test Commands

- `pnpm install` - Install dependencies
- `pnpm run build` - Lint and compile TypeScript
- `pnpm run compile` - Compile TypeScript only
- `pnpm run test` - Run linting, type tests, and coverage tests
- `pnpm run test:unit` - Run unit tests only
- `pnpm run test:cover` - Run unit tests with coverage
- `pnpm run test:tsd` - Run TypeScript definition tests
- `pnpm run lint` - Run ESLint
- `pnpm run ci` - Full CI pipeline (lint, compile, type tests, coverage)

Run a single test:
```sh
pnpm run test:unit -- --grep "test name pattern"
```

## Architecture

### Two Evaluation Systems

1. **Expression Evaluator** (`src/lib/evaluator.ts`): Evaluates boolean expressions against a context
   - `evaluate()` - Returns boolean result
   - `evaluateWithReason()` - Returns `{result, reason}` where reason is the minimal expression that caused the result. For `and`/`or`, reason is always wrapped in array form (e.g., `{or: [reason]}`)
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
- Lines ~120 characters max
- 100% code coverage required
- Type tests use TSD in `src/test/types/`
- Linting via ESLint (flat config in `eslint.config.mjs`)
- Testing via Vitest

## Node.js Support

Supports Node.js ^20, ^22, or ^24

## CI/CD

- CI runs on **Ubuntu, macOS, and Windows**
- Tests run across all supported Node.js versions
- Primary checks (Snyk, coverage, type tests) run on Ubuntu + Node 24

## Cross-Platform Notes

- Avoid shell-specific glob patterns in npm scripts (let tools handle glob expansion internally)
- Use forward slashes in paths within config files (ESLint, TypeScript handle this cross-platform)
