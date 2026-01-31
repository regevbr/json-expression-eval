import { describe, it, expect } from 'vitest';
import {ValidationContext, RulesEngine, Rule, validateRules, evaluateRules} from '../';

const functionsTable = {
    user: (user: string, context: { userId: string }, runOpts: {validation: boolean; custom: {dryRun: boolean}})
        : boolean => {
        return context.userId === user;
    },
    userComplex: async (user: string, context: { userId: string },
                        runOpts: {validation: boolean, custom: {dryRun: boolean}}): Promise<boolean> => {
        if (runOpts.validation && !runOpts.custom.dryRun) {
            throw new Error(`Failed user validation`);
        }
        return runOpts.validation || runOpts.custom.dryRun ? true : context.userId === user;
    },
};

const ruleFunctionsTable = {
    userRule: async (user: string, context: { userId: string },
                     runOpts: {validation: boolean; custom: {dryRun: boolean}}): Promise<void | {
        message: string;
        custom: number;
    }> => {
        if (context.userId === user) {
            return {
                message: `Username ${user} is not allowed`,
                custom: 543,
            };
        }
    },
    userRuleComplex: async (user: string, context: { userId: string },
                        runOpts: {validation: boolean, custom: {dryRun: boolean}}): Promise<void | {
        message: string;
        custom: number;
    }> => {
        if (runOpts.validation && !runOpts.custom.dryRun) {
            throw new Error(`Failed user validation`);
        }
        if (runOpts.validation || runOpts.custom.dryRun || context.userId === user) {
            return {
                message: `Username ${user} is not allowed`,
                custom: 543,
            };
        }
    },
};

type ExpressionFunction = typeof functionsTable;
type RuleFunction = typeof ruleFunctionsTable;
type Ignore = never;
type CustomEngineRuleFuncRunOptions = {dryRun: boolean};

describe('engine', () => {

    it('should fail on empty condition', async () => {
        type Con = {
            timesCounter?: number;
            userId: string,
            nested: {
                value2: number | undefined,
                value: number | null,
            },
        }
        const rules: Rule<number, RuleFunction, Con, ExpressionFunction, Ignore, CustomEngineRuleFuncRunOptions>[] = [
            // @ts-ignore
            {
                consequence: {
                    message: ['user', {ref: 'userId'}, 'should not equal b'],
                    custom: 579,
                },
            },
        ];
        const context: Con = {
            userId: 'a',
            nested: {
                value2: 9,
                value: 7,
            },
        };
        const validationContext: ValidationContext<Con> = {
            timesCounter: 5,
            userId: 'a',
            nested: {
                value2: 9,
                value: 7,
            },
        };
        const runOpts: CustomEngineRuleFuncRunOptions = {dryRun: false};
        const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>
        (functionsTable, ruleFunctionsTable);
        await expect(engine.validate(rules, validationContext, runOpts))
            .rejects.toThrow('Missing condition for rule');
        await expect(validateRules<number, Con, RuleFunction, ExpressionFunction, Ignore,
            CustomEngineRuleFuncRunOptions>(rules, validationContext,
            functionsTable, ruleFunctionsTable, runOpts))
            .rejects.toThrow('Missing condition for rule');
        await expect(evaluateRules<number, Con, RuleFunction, ExpressionFunction, Ignore,
            CustomEngineRuleFuncRunOptions>(rules, context, functionsTable
            , ruleFunctionsTable, true, runOpts)).rejects.toThrow('Missing condition for rule');
        await expect(evaluateRules<number, Con, RuleFunction, ExpressionFunction, Ignore,
            CustomEngineRuleFuncRunOptions>(rules, context, functionsTable
            , ruleFunctionsTable, false, runOpts)).rejects.toThrow('Missing condition for rule');
        await expect(engine.evaluate(rules, context, runOpts)).rejects.toThrow('Missing condition for rule');
        await expect(engine.evaluateAll(rules, context, runOpts))
            .rejects.toThrow('Missing condition for rule');
    });

    it('should fail on empty consequence', async () => {
        type Con = {
            timesCounter?: number;
            userId: string,
            nested: {
                value2: number | undefined,
                value: number | null,
            },
        }
        const rules: Rule<number, RuleFunction, Con, ExpressionFunction, Ignore, CustomEngineRuleFuncRunOptions>[] = [
            // @ts-ignore
            {
                condition: {
                    'userId': 'n',
                },
            },
        ];
        const context: Con = {
            userId: 'a',
            nested: {
                value2: 9,
                value: 7,
            },
        };
        const validationContext: ValidationContext<Con> = {
            timesCounter: 5,
            userId: 'a',
            nested: {
                value2: 9,
                value: 7,
            },
        };
        const runOpts: CustomEngineRuleFuncRunOptions = {dryRun: false};
        const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>
        (functionsTable, ruleFunctionsTable);
        await expect(engine.validate(rules, validationContext, runOpts))
            .rejects.toThrow('Missing consequence for rule');
        await expect(validateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, validationContext,
            functionsTable, ruleFunctionsTable, runOpts))
            .rejects.toThrow('Missing consequence for rule');
        await expect(evaluateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, context, functionsTable
            , ruleFunctionsTable, true, runOpts)).rejects.toThrow('Missing consequence for rule');
        await expect(evaluateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, context, functionsTable
            , ruleFunctionsTable, false, runOpts)).rejects.toThrow('Missing consequence for rule');
        await expect(engine.evaluate(rules, context, runOpts)).rejects.toThrow('Missing consequence for rule');
        await expect(engine.evaluateAll(rules, context, runOpts))
            .rejects.toThrow('Missing consequence for rule');
    });

    it('should fail on bad condition', async () => {
        type Con = {
            timesCounter?: number;
            userId: string,
            nested: {
                value2: number | undefined,
                value: number | null,
            },
        }
        const rules: Rule<number, RuleFunction, Con, ExpressionFunction, Ignore, CustomEngineRuleFuncRunOptions>[] = [
            {
                condition: {
                    // @ts-ignore
                    'userIds': 'n',
                },
                consequence: {
                    message: ['user', {ref: 'userId'}, 'should not equal b'],
                    custom: 579,
                },
            },
        ];
        const validationContext: ValidationContext<Con> = {
            timesCounter: 5,
            userId: 'a',
            nested: {
                value2: 9,
                value: 7,
            },
        };
        const runOpts: CustomEngineRuleFuncRunOptions = {dryRun: false};
        const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>
        (functionsTable, ruleFunctionsTable);
        await expect(engine.validate(rules, validationContext, runOpts))
            .rejects.toThrow('Invalid expression - unknown context key userIds');
        await expect(validateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, validationContext,
            functionsTable, ruleFunctionsTable, runOpts))
            .rejects.toThrow('Invalid expression - unknown context key userIds');
    });

    it('should fail on bad consequence ref', async () => {
        type Con = {
            timesCounter?: number;
            userId: string,
            nested: {
                value2: number | undefined,
                value: number | null,
            },
        }
        const rules: Rule<number, RuleFunction, Con, ExpressionFunction, Ignore, CustomEngineRuleFuncRunOptions>[] = [
            {
                condition: {
                    'userId': 'a',
                },
                consequence: {
                    message: ['user', {
                        // @ts-ignore
                        ref: 'userIdd',
                    }, 'should not equal a'],
                    custom: 579,
                },
            },
        ];
        const context: Con = {
            userId: 'a',
            nested: {
                value2: 9,
                value: 7,
            },
        };
        const validationContext: ValidationContext<Con> = {
            timesCounter: 5,
            userId: 'a',
            nested: {
                value2: 9,
                value: 7,
            },
        };
        const runOpts: CustomEngineRuleFuncRunOptions = {dryRun: false};
        const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>
        (functionsTable, ruleFunctionsTable);
        await expect(engine.validate(rules, validationContext, runOpts))
            .rejects.toThrow('Invalid consequence ref - unknown context key userIdd');
        await expect(validateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, validationContext,
            functionsTable, ruleFunctionsTable, runOpts))
            .rejects.toThrow('Invalid consequence ref - unknown context key userIdd');
        await expect(evaluateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, context, functionsTable
            , ruleFunctionsTable, true, runOpts)).rejects.toThrow('Invalid consequence ref - unknown context key userIdd');
        await expect(evaluateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, context, functionsTable
            , ruleFunctionsTable, false, runOpts)).rejects.toThrow('Invalid consequence ref - unknown context key userIdd');
        await expect(engine.evaluate(rules, context, runOpts)).rejects.toThrow('Invalid consequence ref - unknown context key userIdd');
        await expect(engine.evaluateAll(rules, context, runOpts))
            .rejects.toThrow('Invalid consequence ref - unknown context key userIdd');
    });

    it('should pass run opts to functions', async () => {
        type Con = {
            userId: string,
        }
        const rules: Rule<number, RuleFunction, Con, ExpressionFunction, Ignore, CustomEngineRuleFuncRunOptions>[] = [
            {
                condition: {
                    userComplex: 'b',
                },
                consequence: {
                    message: ['user', {ref: 'userId'}, 'should not equal b'],
                    custom: 579,
                },
            },
        ];
        const validationContext: ValidationContext<Con> = {
            userId: 'a',
        };
        const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>
        (functionsTable, ruleFunctionsTable);
        await expect(engine.validate(rules, validationContext, {dryRun: false}))
            .rejects.toThrow('Failed user validation');
        expect(await engine.validate(rules, validationContext, {dryRun: true})).toBeUndefined();
        await expect(validateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, validationContext,
            functionsTable, ruleFunctionsTable, {dryRun: false}))
            .rejects.toThrow('Failed user validation');
        expect(await validateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, validationContext,
            functionsTable, ruleFunctionsTable, {dryRun: true})).toBeUndefined();
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, {
                userId: 'b',
            }, functionsTable
            , ruleFunctionsTable, true, {dryRun: false})).toEqual([
            {
                'custom': 579,
                'message': 'user b should not equal b',
            },
        ]);
        expect(await engine.evaluate(rules, {
            userId: 'b',
        }, {dryRun: false})).toEqual(
            {
                'custom': 579,
                'message': 'user b should not equal b',
            }
        );
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, {
                userId: 'a',
            }, functionsTable
            , ruleFunctionsTable, true, {dryRun: false})).toEqual(undefined);
        expect(await engine.evaluate(rules, {
            userId: 'a',
        }, {dryRun: false})).toEqual(undefined);
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, {
                userId: 'a',
            }, functionsTable
            , ruleFunctionsTable, true, {dryRun: true})).toEqual([
            {
                'custom': 579,
                'message': 'user a should not equal b',
            },
        ]);
        expect(await engine.evaluate(rules, {
            userId: 'a',
        }, {dryRun: true})).toEqual(
            {
                'custom': 579,
                'message': 'user a should not equal b',
            }
        );
    });

    it('should pass run opts to rules', async () => {
        type Con = {
            userId: string,
        }
        const rules: Rule<number, RuleFunction, Con, ExpressionFunction, Ignore, CustomEngineRuleFuncRunOptions>[] = [
            {
                userRuleComplex: 'b',
            },
        ];
        const validationContext: ValidationContext<Con> = {
            userId: 'a',
        };
        const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>
        (functionsTable, ruleFunctionsTable);
        await expect(engine.validate(rules, validationContext, {dryRun: false}))
            .rejects.toThrow('Failed user validation');
        expect(await engine.validate(rules, validationContext, {dryRun: true})).toBeUndefined();
        await expect(validateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, validationContext,
            functionsTable, ruleFunctionsTable, {dryRun: false}))
            .rejects.toThrow('Failed user validation');
        expect(await validateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, validationContext,
            functionsTable, ruleFunctionsTable, {dryRun: true})).toBeUndefined();
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, {
                userId: 'b',
            }, functionsTable
            , ruleFunctionsTable, true, {dryRun: false})).toEqual([
            {
                'custom': 543,
                'message': 'Username b is not allowed',
            },
        ]);
        expect(await engine.evaluate(rules, {
            userId: 'b',
        }, {dryRun: false})).toEqual(
            {
                'custom': 543,
                'message': 'Username b is not allowed',
            }
        );
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, {
                userId: 'a',
            }, functionsTable
            , ruleFunctionsTable, true, {dryRun: false})).toEqual(undefined);
        expect(await engine.evaluate(rules, {
            userId: 'a',
        }, {dryRun: false})).toEqual(undefined);
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, {
                userId: 'a',
            }, functionsTable
            , ruleFunctionsTable, true, {dryRun: true})).toEqual([
            {
                'custom': 543,
                'message': 'Username b is not allowed',
            },
        ]);
        expect(await engine.evaluate(rules, {
            userId: 'a',
        }, {dryRun: true})).toEqual(
            {
                'custom': 543,
                'message': 'Username b is not allowed',
            }
        );
    });

    it('should evaluate and pass properly', async () => {
        type Con = {
            timesCounter?: number;
            userId: string,
            nested: {
                value2: number | undefined,
                value: number | null,
            },
        }
        const rules: Rule<number, RuleFunction, Con, ExpressionFunction, Ignore, CustomEngineRuleFuncRunOptions>[] = [
            {
                condition: {
                    user: 'b',
                },
                consequence: {
                    message: ['user', {ref: 'userId'}, 'should not equal b'],
                    custom: 579,
                },
            },
            {
                condition: {
                    'nested.value': 10,
                },
                consequence: {
                    message: ['nested value', {ref: 'nested.value'}, 'should not equal 7 days'],
                    custom: 578,
                },
            },
            {
                userRule: 'c',
            },
        ];
        const context: Con = {
            userId: 'a',
            nested: {
                value2: 9,
                value: 7,
            },
        };
        const validationContext: ValidationContext<Con> = {
            timesCounter: 5,
            userId: 'a',
            nested: {
                value2: 9,
                value: 7,
            },
        };
        const runOpts: CustomEngineRuleFuncRunOptions = {dryRun: false};
        const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>
        (functionsTable, ruleFunctionsTable);
        expect(await engine.validate(rules, validationContext, runOpts)).toBeUndefined();
        expect(await validateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, validationContext,
            functionsTable, ruleFunctionsTable, runOpts)).toBeUndefined();
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, context, functionsTable
            , ruleFunctionsTable, true, runOpts)).toEqual(undefined);
        expect(await engine.evaluate(rules, context, runOpts)).toEqual(undefined);
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, context, functionsTable
            , ruleFunctionsTable, false, runOpts)).toEqual(undefined);
        expect(await engine.evaluateAll(rules, context, runOpts)).toEqual(undefined);
    });

    it('should evaluate and fail properly on regular rule', async () => {
        type Con = {
            timesCounter?: number;
            userId: string,
            nested: {
                value2: number | undefined,
                value: number | null,
            },
        }
        const rules: Rule<number, RuleFunction, Con, ExpressionFunction, Ignore, CustomEngineRuleFuncRunOptions>[] = [
            {
                condition: {
                    user: 'b',
                },
                consequence: {
                    message: ['user', {ref: 'userId'}, 'should not equal b'],
                    custom: 579,
                },
            },
            {
                condition: {
                    'nested.value': 7,
                },
                consequence: {
                    message: ['nested value', {ref: 'nested.value'}, 'should not equal 7 days'],
                    custom: 578,
                },
            },
            {
                userRule: 'c',
            },
        ];
        const context: Con = {
            userId: 'a',
            nested: {
                value2: 9,
                value: 7,
            },
        };
        const validationContext: ValidationContext<Con> = {
            timesCounter: 5,
            userId: 'a',
            nested: {
                value2: 9,
                value: 7,
            },
        };
        const runOpts: CustomEngineRuleFuncRunOptions = {dryRun: false};
        const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>
        (functionsTable, ruleFunctionsTable);
        expect(await engine.validate(rules, validationContext, runOpts)).toBeUndefined();
        expect(await validateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, validationContext,
            functionsTable, ruleFunctionsTable, runOpts)).toBeUndefined();
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, context, functionsTable
            , ruleFunctionsTable, true, runOpts)).toEqual([{
            'custom': 578,
            'message': 'nested value 7 should not equal 7 days',
        }]);
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, context, functionsTable
            , ruleFunctionsTable, false, runOpts)).toEqual([{
            'custom': 578,
            'message': 'nested value 7 should not equal 7 days',
        }]);
        expect(await engine.evaluate(rules, context, runOpts)).toEqual({
            'custom': 578,
            'message': 'nested value 7 should not equal 7 days',
        });
        expect(await engine.evaluateAll(rules, context, runOpts)).toEqual([{
            'custom': 578,
            'message': 'nested value 7 should not equal 7 days',
        }]);
    });

    it('should evaluate and fail properly on function rule', async () => {
        type Con = {
            timesCounter?: number;
            userId: string,
            nested: {
                value2: number | undefined,
                value: number | null,
            },
        }
        const rules: Rule<number, RuleFunction, Con, ExpressionFunction, Ignore, CustomEngineRuleFuncRunOptions>[] = [
            {
                condition: {
                    user: 'b',
                },
                consequence: {
                    message: ['user', {ref: 'userId'}, 'should not equal b'],
                    custom: 579,
                },
            },
            {
                condition: {
                    'nested.value': 9,
                },
                consequence: {
                    message: ['nested value', {ref: 'nested.value'}, 'should not equal 9 days'],
                    custom: 578,
                },
            },
            {
                userRule: 'a',
            },
        ];
        const context: Con = {
            userId: 'a',
            nested: {
                value2: 9,
                value: 7,
            },
        };
        const validationContext: ValidationContext<Con> = {
            timesCounter: 5,
            userId: 'a',
            nested: {
                value2: 9,
                value: 7,
            },
        };
        const runOpts: CustomEngineRuleFuncRunOptions = {dryRun: false};
        const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>
        (functionsTable, ruleFunctionsTable);
        expect(await engine.validate(rules, validationContext, runOpts)).toBeUndefined();
        expect(await validateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, validationContext,
            functionsTable, ruleFunctionsTable, runOpts)).toBeUndefined();
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, context, functionsTable
            , ruleFunctionsTable, true, runOpts)).toEqual([{
            'custom': 543,
            'message': 'Username a is not allowed',
        }]);
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, context, functionsTable
            , ruleFunctionsTable, false, runOpts)).toEqual([{
            'custom': 543,
            'message': 'Username a is not allowed',
        }]);
        expect(await engine.evaluate(rules, context, runOpts)).toEqual({
            'custom': 543,
            'message': 'Username a is not allowed',
        });
        expect(await engine.evaluateAll(rules, context, runOpts)).toEqual([{
            'custom': 543,
            'message': 'Username a is not allowed',
        }]);
    });

    it('should evaluate and fail properly on regular rule with function', async () => {
        type Con = {
            timesCounter?: number;
            userId: string,
            nested: {
                value2: number | undefined,
                value: number | null,
            },
        }
        const rules: Rule<number, RuleFunction, Con, ExpressionFunction, Ignore, CustomEngineRuleFuncRunOptions>[] = [
            {
                condition: {
                    user: 'a',
                },
                consequence: {
                    message: ['user', {ref: 'userId'}, 'should not equal a'],
                    custom: 579,
                },
            },
            {
                condition: {
                    'nested.value': 9,
                },
                consequence: {
                    message: ['nested value', {ref: 'nested.value'}, 'should not equal 9 days'],
                    custom: 578,
                },
            },
            {
                userRule: 'c',
            },
        ];
        const context: Con = {
            userId: 'a',
            nested: {
                value2: 9,
                value: 7,
            },
        };
        const validationContext: ValidationContext<Con> = {
            timesCounter: 5,
            userId: 'a',
            nested: {
                value2: 9,
                value: 7,
            },
        };
        const runOpts: CustomEngineRuleFuncRunOptions = {dryRun: false};
        const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>
        (functionsTable, ruleFunctionsTable);
        expect(await engine.validate(rules, validationContext, runOpts)).toBeUndefined();
        expect(await validateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, validationContext,
            functionsTable, ruleFunctionsTable, runOpts)).toBeUndefined();
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, context, functionsTable
            , ruleFunctionsTable, true, runOpts)).toEqual([{
            'custom': 579,
            'message': 'user a should not equal a',
        }]);
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, context, functionsTable
            , ruleFunctionsTable, false, runOpts)).toEqual([{
            'custom': 579,
            'message': 'user a should not equal a',
        }]);
        expect(await engine.evaluate(rules, context, runOpts)).toEqual({
            'custom': 579,
            'message': 'user a should not equal a',
        });
        expect(await engine.evaluateAll(rules, context, runOpts)).toEqual([{
            'custom': 579,
            'message': 'user a should not equal a',
        }]);
    });

    it('should evaluate and fail properly on multiple rules', async () => {
        type Con = {
            timesCounter?: number;
            userId: string,
            nested: {
                value2: number | undefined,
                value: number | null,
            },
        }
        const rules: Rule<number, RuleFunction, Con, ExpressionFunction, Ignore, CustomEngineRuleFuncRunOptions>[] = [
            {
                condition: {
                    user: 'a',
                },
                consequence: {
                    message: 'user should not equal a',
                    custom: 579,
                },
            },
            {
                condition: {
                    'nested.value': 9,
                },
                consequence: {
                    message: ['nested value', {ref: 'nested.value'}, 'should not equal 9 days'],
                    custom: 578,
                },
            },
            {
                userRule: 'a',
            },
        ];
        const context: Con = {
            userId: 'a',
            nested: {
                value2: 9,
                value: 7,
            },
        };
        const validationContext: ValidationContext<Con> = {
            timesCounter: 5,
            userId: 'a',
            nested: {
                value2: 9,
                value: 7,
            },
        };
        const runOpts: CustomEngineRuleFuncRunOptions = {dryRun: false};
        const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>
        (functionsTable, ruleFunctionsTable);
        expect(await engine.validate(rules, validationContext, runOpts)).toBeUndefined();
        expect(await validateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, validationContext,
            functionsTable, ruleFunctionsTable, runOpts)).toBeUndefined();
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, context, functionsTable
            , ruleFunctionsTable, true, runOpts)).toEqual([{
            'custom': 579,
            'message': 'user should not equal a',
        }]);
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction,
            Ignore, CustomEngineRuleFuncRunOptions>(rules, context, functionsTable
            , ruleFunctionsTable, false, runOpts)).toEqual([
            {
                'custom': 579,
                'message': 'user should not equal a',
            },
            {
                'custom': 543,
                'message': 'Username a is not allowed',
            },
        ]);
        expect(await engine.evaluate(rules, context, runOpts)).toEqual({
            'custom': 579,
            'message': 'user should not equal a',
        });
        expect(await engine.evaluateAll(rules, context, runOpts)).toEqual([
            {
                'custom': 579,
                'message': 'user should not equal a',
            },
            {
                'custom': 543,
                'message': 'Username a is not allowed',
            },
        ]);
    });

});
