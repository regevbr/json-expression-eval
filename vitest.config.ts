import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['src/test/**/*.spec.ts'],
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['lcov', 'text-summary'],
            include: ['src/lib/**/*.ts', 'src/types/**/*.ts'],
            exclude: ['src/test/**'],
            thresholds: {
                statements: 100,
                branches: 100,
                functions: 100,
                lines: 100,
            },
        },
    },
});
