import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                ...globals.node,
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
        },
        rules: {
            // TypeScript recommended rules
            ...tsPlugin.configs.recommended.rules,

            // Single quotes with avoid-escape (matching TSLint quotemark)
            // Allow template literals as they're commonly used in the codebase
            quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],

            // Max line length 120 with ignore patterns for imports/exports
            'max-len': ['error', {
                code: 120,
                ignorePattern: '^import |^export \\{(.*?)\\}|class [a-zA-Z]+ implements |//',
                ignoreUrls: true,
                ignoreStrings: true,
                ignoreTemplateLiterals: true,
            }],

            // Trailing commas - disabled to match existing codebase style
            'comma-dangle': 'off',

            // Disabled rules (matching TSLint config)
            'no-empty': 'off',
            'no-console': 'off',
            'no-unused-expressions': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',

            // Allow unused vars/params - matching TSLint which didn't enforce this strictly
            '@typescript-eslint/no-unused-vars': 'off',

            // Other disabled TypeScript rules
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',

            // Disable rules that TypeScript handles
            'no-undef': 'off',
            'no-redeclare': 'off',

            // Semicolons - disabled to match existing codebase style
            semi: 'off',

            // Disable multiline check - TypeScript handles this
            'no-unexpected-multiline': 'off',
        },
    },
    {
        ignores: ['dist/**', 'node_modules/**'],
    },
];
