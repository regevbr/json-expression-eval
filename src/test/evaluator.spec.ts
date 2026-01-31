import { describe, it, expect } from 'vitest';
import {evaluate, ExpressionHandler, validate, ValidationContext, evaluateWithReason} from '../';

// Helper to verify that the reason expression evaluates to the same result
async function verifyReasonEvaluatesToSameResult(
    result: {result: boolean; reason: any},
    context: any,
    fnTable: any,
    runOpts: any
): Promise<void> {
    const reasonResult = await evaluate(result.reason, context, fnTable, runOpts);
    expect(reasonResult).toEqual(result.result);
}

const functionsTable = {
    user: async (user: string, context: { userId: string },
                 runOpts: {validation: boolean, custom: {dryRun: boolean}}): Promise<boolean> => {
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
type ExpressionFunction = typeof functionsTable;

type Ignore = never;
type CustomEvaluatorFuncRunOptions = {dryRun: boolean};

describe('evaluator', () => {

    describe(`eq`, () => {
        it('should evaluate short eq compare op true to on nested properties', async () => {
            const expression = {
                'nested.value': 7,
            };
            type Con = {
                timesCounter?: number;
                userId: string,
                nested: {
                    value2: number | undefined,
                    value: number | null,
                },
            }
            const context = {
                userId: 'a',
                nested: {
                    value2: 9,
                    value: 7,
                },
            };
            const validationContext = {
                timesCounter: 5,
                userId: 'a',
                nested: {
                    value2: 9,
                    value: 7,
                },
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const exp = new ExpressionHandler<Con, ExpressionFunction, Ignore, CustomEvaluatorFuncRunOptions>(
                expression, functionsTable);
            expect(await exp.validate(validationContext, runOpts)).toBeUndefined();
            expect(await validate<Con, ExpressionFunction, Ignore, CustomEvaluatorFuncRunOptions>(
                expression, validationContext, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
            expect(await exp.evaluate(context, runOpts)).toEqual(true);
        });

        it('should evaluate short eq compare op true to on deeply nested properties', async () => {
            const expression = {
                or: [
                    {
                        'nested.nested2.value': 7,
                    },
                    {
                        'nested.value': 4,
                    },
                ],
            };
            const context = {
                timesCounter: 5,
                userId: 'a',
                nested: {
                    value: 4,
                    nested2: {
                        value: 7,
                    },
                },
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate short eq compare op to true', async () => {
            const expression = {
                timesCounter: 5,
            };
            const context = {
                timesCounter: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate short eq compare op to false', async () => {
            const expression = {
                timesCounter: 5,
            };
            const context = {
                timesCounter: 7,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });

        it('should evaluate eq compare op to true', async () => {
            const expression = {
                timesCounter: {eq: 5},
            };
            const context = {
                timesCounter: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate ref eq compare op to true', async () => {
            const expression = {
                timesCounter: {eq: {ref: 'timesCounterToCompare' as const}},
            };
            const context = {
                timesCounter: 5,
                timesCounterToCompare: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate math ref eq compare op to true', async () => {
            const expression = {
                timesCounter: {eq: {op: '+' as const, lhs: 1, rhs: {ref: 'timesCounterToCompare' as const}}},
            };
            const context = {
                timesCounter: 5,
                timesCounterToCompare: 4,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate eq compare op to true on nested properties', async () => {
            const expression = {
                'nested.value': {
                    eq: 7,
                },
            };
            const context = {
                timesCounter: 5,
                userId: 'a',
                nested: {
                    value: 7,
                },
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate ref eq compare op to true on nested properties', async () => {
            const expression = {
                'nested.value': {
                    eq: {
                        ref: 'nested2.value2' as const,
                    },
                },
            };
            const context = {
                timesCounter: 5,
                userId: 'a',
                nested: {
                    value: 7,
                },
                nested2: {
                    value2: 7,
                },
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate eq compare op true to on deeply nested properties', async () => {
            const expression = {
                or: [
                    {
                        'nested.nested2.value': {
                            eq: 7,
                        },
                    },
                    {
                        'nested.value': {
                            eq: 4,
                        },
                    },
                ],
            };
            const context = {
                timesCounter: 5,
                userId: 'a',
                nested: {
                    value: 4,
                    nested2: {
                        value: 7,
                    },
                },
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate eq compare ref op true to on deeply nested properties', async () => {
            const expression = {
                or: [
                    {
                        'nested.nested2.value': {
                            eq: {ref: 'nested2.nested2.value' as const},
                        },
                    },
                    {
                        'nested.value': {
                            eq: 4,
                        },
                    },
                ],
            };
            const context = {
                timesCounter: 5,
                userId: 'a',
                nested: {
                    value: 4,
                    nested2: {
                        value: 7,
                    },
                },
                nested2: {
                    value: 4,
                    nested2: {
                        value: 7,
                    },
                },
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate eq compare op to false', async () => {
            const expression = {
                timesCounter: {eq: 5},
            };
            const context = {
                timesCounter: 7,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });

        it('should evaluate ref eq compare op to false', async () => {
            const expression = {
                timesCounter: {eq: {ref: 'timesCounterRef' as const}},
            };
            const context = {
                timesCounter: 7,
                timesCounterRef: 8,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });
    });

    describe(`neq`, () => {
        it('should evaluate neq compare op to true', async () => {
            const expression = {
                timesCounter: {neq: 5},
            };
            const context = {
                timesCounter: 8,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate ref neq compare op to true', async () => {
            const expression = {
                timesCounter: {neq: {ref: 'timesCounterRef' as const}},
            };
            const context = {
                timesCounter: 8,
                timesCounterRef: 9,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate neq compare op to false', async () => {
            const expression = {
                timesCounter: {neq: 5},
            };
            const context = {
                timesCounter: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });

        it('should evaluate ref neq compare op to false', async () => {
            const expression = {
                timesCounter: {neq: {ref: 'timesCounterRef' as const}},
            };
            const context = {
                timesCounter: 5,
                timesCounterRef: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });

        it('should evaluate math ref neq compare op to false', async () => {
            const expression = {
                timesCounter: {neq: {op: '-' as const, lhs: {ref: 'timesCounterRef' as const}, rhs: 1}},
            };
            const context = {
                timesCounter: 5,
                timesCounterRef: 6,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });
    });

    describe(`gt`, () => {

        it('should evaluate gt compare op to true', async () => {
            const expression = {
                timesCounter: {gt: 5},
            };
            const context = {
                timesCounter: 8,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate ref gt compare op to true', async () => {
            const expression = {
                timesCounter: {gt: {ref: 'timesCounterRef' as const}},
            };
            const context = {
                timesCounter: 8,
                timesCounterRef: 4,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate math ref gt compare op to true', async () => {
            const expression = {
                timesCounter: {gt: {op: '*' as const, lhs: {ref: 'timesCounterRef' as const}, rhs: 2}},
            };
            const context = {
                timesCounter: 8,
                timesCounterRef: 1,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate gt compare op to false', async () => {
            const expression = {
                timesCounter: {gt: 5},
            };
            const context = {
                timesCounter: 3,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });

        it('should evaluate ref gt compare op to false', async () => {
            const expression = {
                timesCounter: {gt: {ref: 'timesCounterRef' as const}},
            };
            const context = {
                timesCounter: 3,
                timesCounterRef: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });

        it('should evaluate gt compare op to false 2', async () => {
            const expression = {
                timesCounter: {gt: 5},
            };
            const context = {
                timesCounter: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });

    });

    describe(`gte`, () => {
        it('should evaluate gte compare op to true', async () => {
            const expression = {
                timesCounter: {gte: 5},
            };
            const context = {
                timesCounter: 8,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate ref gte compare op to true', async () => {
            const expression = {
                timesCounter: {gte: {ref: 'timesCounterRef' as const}},
            };
            const context = {
                timesCounter: 8,
                timesCounterRef: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate math ref gte compare op to true', async () => {
            const expression = {
                timesCounter: {
                    gte: {
                        op: '/' as const, lhs: {ref: 'timesCounterRef' as const},
                        rhs: {ref: 'timesCounterRefDivider' as const},
                    },
                },
            };
            const context = {
                timesCounter: 8,
                timesCounterRef: 10,
                timesCounterRefDivider: 2,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate gte compare op to true 2', async () => {
            const expression = {
                timesCounter: {gte: 5},
            };
            const context = {
                timesCounter: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate gte compare op to false', async () => {
            const expression = {
                timesCounter: {gte: 5},
            };
            const context = {
                timesCounter: 3,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });
    });

    describe(`between`, () => {
        it('should evaluate between compare op to true when low=high', async () => {
            const expression = {
                timesCounter: {between: [8, 8] as const},
            };
            const context = {
                timesCounter: 8,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate between compare op to true', async () => {
            const expression = {
                timesCounter: {between: [5, 10] as const},
            };
            const context = {
                timesCounter: 8,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate between left ref compare op to true', async () => {
            const expression = {
                timesCounter: {between: [{ref: 'timesCounterRefLeft' as const}, 10] as const},
            };
            const context = {
                timesCounter: 8,
                timesCounterRefLeft: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate between left ref compare op and right math op to true', async () => {
            const expression = {
                timesCounter: {
                    between: [{op: '-' as const, rhs: {ref: 'timesCounterRefLeft' as const}, lhs: 10}, {
                        op: '+' as const,
                        lhs: 4,
                        rhs: 6,
                    }] as const,
                },
            };
            const context = {
                timesCounter: 8,
                timesCounterRefLeft: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate between right ref compare op to true', async () => {
            const expression = {
                timesCounter: {between: [5, {ref: 'timesCounterRefRight' as const}] as const},
            };
            const context = {
                timesCounter: 8,
                timesCounterRefRight: 10,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate between compare op to true low equal', async () => {
            const expression = {
                timesCounter: {between: [5, 10] as const},
            };
            const context = {
                timesCounter: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate between compare op to true high equal', async () => {
            const expression = {
                timesCounter: {between: [5, 10] as const},
            };
            const context = {
                timesCounter: 10,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate between compare op to false', async () => {
            const expression = {
                timesCounter: {between: [5, 10] as const},
            };
            const context = {
                timesCounter: 3,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });

        it('should fail on empty between compare op', async () => {
            const expression = {
                timesCounter: {between: [] as any},
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const context = {userId: 'r@a.com', timesCounter: 8};
            await expect(validate(expression, context, functionsTable, runOpts))
                .rejects.toThrow('Invalid expression - timesCounter.length must be 2');
            await expect(evaluate(expression, context, functionsTable, runOpts))
                .rejects.toThrow('Invalid expression - timesCounter.length must be 2');
        });

        it('should fail on single value between compare op', async () => {
            const expression = {
                timesCounter: {between: [1] as any},
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const context = {userId: 'r@a.com', timesCounter: 8};
            await expect(validate(expression, context, functionsTable, runOpts))
                .rejects.toThrow('Invalid expression - timesCounter.length must be 2');
            await expect(evaluate(expression, context, functionsTable, runOpts))
                .rejects.toThrow('Invalid expression - timesCounter.length must be 2');
        });

        it('should fail on too many values value between compare op', async () => {
            const expression = {
                timesCounter: {between: [1, 2, 3] as any},
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const context = {userId: 'r@a.com', timesCounter: 8};
            await expect(validate(expression, context, functionsTable, runOpts))
                .rejects.toThrow('Invalid expression - timesCounter.length must be 2');
            await expect(evaluate(expression, context, functionsTable, runOpts))
                .rejects.toThrow('Invalid expression - timesCounter.length must be 2');
        });

        it('should fail on non number value between compare op', async () => {
            const expression = {
                timesCounter: {between: ['s', 4] as any},
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const context = {userId: 'r@a.com', timesCounter: 8};
            await expect(validate(expression, context, functionsTable, runOpts))
                .rejects.toThrow('Invalid expression - timesCounter[0] must be a number');
            await expect(evaluate(expression, context, functionsTable, runOpts))
                .rejects.toThrow('Invalid expression - timesCounter[0] must be a number');
        });

        it('should fail on non number value between compare op 2', async () => {
            const expression = {
                timesCounter: {between: [4, 's'] as any},
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const context = {userId: 'r@a.com', timesCounter: 8};
            await expect(validate(expression, context, functionsTable, runOpts))
                .rejects.toThrow('Invalid expression - timesCounter[1] must be a number');
            await expect(evaluate(expression, context, functionsTable, runOpts))
                .rejects.toThrow('Invalid expression - timesCounter[1] must be a number');
        });

        it('should fail on bad high/low values between compare op', async () => {
            const expression = {
                timesCounter: {between: [4, 3] as any},
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const context = {userId: 'r@a.com', timesCounter: 8};
            await expect(validate(expression, context, functionsTable, runOpts))
                .rejects.toThrow('Invalid expression - timesCounter first value is higher than second value');
            await expect(evaluate(expression, context, functionsTable, runOpts))
                .rejects.toThrow('Invalid expression - timesCounter first value is higher than second value');
        });
    });

    describe(`inq`, () => {
        it('should evaluate inq op to true (number)', async () => {
            const expression = {
                timesCounter: {inq: [5, 8, 10]},
            };
            const context = {
                timesCounter: 8,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate ref inq op to true (number)', async () => {
            const expression = {
                timesCounter: {inq: [5, {ref: 'timesCounterRef' as const}, 10]},
            };
            const context = {
                timesCounter: 8,
                timesCounterRef: 8,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate math ref inq op to true (number)', async () => {
            const expression = {
                timesCounter: {inq: [5, {op: 'pow' as const, rhs: {ref: 'timesCounterRef' as const}, lhs: 2}, 10]},
            };
            const context = {
                timesCounter: 8,
                timesCounterRef: 3,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate inq op to true (string)', async () => {
            const expression = {
                userId: {inq: ['f', 'a']},
            };
            const context = {
                timesCounter: 8,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate inq op to true (string)', async () => {
            const expression = {
                userId: {inq: ['f', {ref: 'userIdRef' as const}]},
            };
            const context = {
                timesCounter: 8,
                userId: 'a',
                userIdRef: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate inq op to false (number)', async () => {
            const expression = {
                timesCounter: {inq: [5, 10]},
            };
            const context = {
                timesCounter: 3,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });

        it('should evaluate inq op to false (string)', async () => {
            const expression = {
                userId: {inq: ['t', 'e']},
            };
            const context = {
                timesCounter: 3,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });

    });

    describe(`nin`, () => {
        it('should evaluate nin op to true (number)', async () => {
            const expression = {
                timesCounter: {nin: [5, 10]},
            };
            const context = {
                timesCounter: 8,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate nin op to true (string)', async () => {
            const expression = {
                userId: {nin: ['f', 'd']},
            };
            const context = {
                timesCounter: 8,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate nin op to false (number)', async () => {
            const expression = {
                timesCounter: {nin: [5, 3, 10]},
            };
            const context = {
                timesCounter: 3,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });

        it('should evaluate ref nin op to false (number)', async () => {
            const expression = {
                timesCounter: {nin: [5, {ref: 'timesCounterRef' as const}, 10]},
            };
            const context = {
                timesCounter: 3,
                timesCounterRef: 3,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });

        it('should evaluate math ref nin op to false (number)', async () => {
            const expression = {
                timesCounter: {nin: [5, {op: '+' as const, rhs: 1, lhs: {ref: 'timesCounterRef' as const}}, 10]},
            };
            const context = {
                timesCounter: 3,
                timesCounterRef: 2,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });

        it('should evaluate nin op to false (string)', async () => {
            const expression = {
                userId: {nin: ['t', 'e', 'a']},
            };
            const context = {
                timesCounter: 3,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });

    });

    describe(`regexp`, () => {
        it('should evaluate regexp op to true', async () => {
            const expression = {
                userId: {regexp: '^a.+C$'},
            };
            const context = {
                timesCounter: 8,
                userId: 'aBdC',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });
        it('should evaluate ref regexp op to true', async () => {
            const expression = {
                userId: {regexp: {ref: 'userIdRegex' as const}},
            };
            const context = {
                timesCounter: 8,
                userId: 'aBdC',
                userIdRegex: '^a.+C$',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });
        it('should evaluate regexpi op to false case sensitive', async () => {
            const expression = {
                userId: {regexp: '^a.+C$'},
            };
            const context = {
                timesCounter: 8,
                userId: 'aBdc',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });
        it('should evaluate regexp op to false', async () => {
            const expression = {
                userId: {regexp: '^a.+C$'},
            };
            const context = {
                timesCounter: 3,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });

    });

    describe(`regexpi`, () => {
        it('should evaluate regexpi op to true', async () => {
            const expression = {
                userId: {regexpi: '^a.+C$'},
            };
            const context = {
                timesCounter: 8,
                userId: 'aBdC',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });
        it('should evaluate ref regexpi op to true', async () => {
            const expression = {
                userId: {regexpi: {ref: 'userIdRegex' as const}},
            };
            const context = {
                timesCounter: 8,
                userId: 'aBdC',
                userIdRegex: '^a.+C$',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });
        it('should evaluate regexpi op to true case insensitive', async () => {
            const expression = {
                userId: {regexpi: '^a.+C$'},
            };
            const context = {
                timesCounter: 8,
                userId: 'aBdc',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });
        it('should evaluate regexpi op to false', async () => {
            const expression = {
                userId: {regexpi: '^a.+C$'},
            };
            const context = {
                timesCounter: 3,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });

    });

    describe(`exists`, () => {
        it('should evaluate exists op to true when value exists', async () => {
            const expression = {
                userId: {exists: true},
            };
            const context = {
                timesCounter: 5,
                userId: 'user@example.com',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate exists op to false when value is null', async () => {
            const expression = {
                userId: {exists: true},
            };
            const context = {
                timesCounter: 5,
                userId: null,
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await evaluate(expression, context, {}, runOpts)).toEqual(false);
        });

        it('should evaluate exists op to false when value is undefined', async () => {
            const expression = {
                userId: {exists: true},
            };
            const context = {
                timesCounter: 5,
                userId: undefined,
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await evaluate(expression, context, {}, runOpts)).toEqual(false);
        });

        it('should evaluate exists op to false for nested undefined property', async () => {
            const expression = {
                'nested.value': {exists: true},
            };
            const context = {
                timesCounter: 5,
                userId: 'user@example.com',
                nested: {
                    otherValue: 'exists',
                },
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await evaluate(expression as any, context, {}, runOpts)).toEqual(false);
        });

        it('should evaluate exists:false to true when value is null', async () => {
            const expression = {
                userId: {exists: false},
            };
            const context = {
                timesCounter: 5,
                userId: null,
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await evaluate(expression, context, {}, runOpts)).toEqual(true);
        });

        it('should evaluate exists:false to true when value is undefined', async () => {
            const expression = {
                userId: {exists: false},
            };
            const context = {
                timesCounter: 5,
                userId: undefined,
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await evaluate(expression, context, {}, runOpts)).toEqual(true);
        });

        it('should evaluate exists:false to false when value exists', async () => {
            const expression = {
                userId: {exists: false},
            };
            const context = {
                timesCounter: 5,
                userId: 'user@example.com',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });

        it('should consider falsy values as existing (0)', async () => {
            const expression = {
                timesCounter: {exists: true},
            };
            const context = {
                timesCounter: 0,
                userId: 'user@example.com',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should consider falsy values as existing (false)', async () => {
            const expression = {
                isActive: {exists: true},
            };
            const context = {
                timesCounter: 5,
                userId: 'user@example.com',
                isActive: false,
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should consider falsy values as existing (empty string)', async () => {
            const expression = {
                userId: {exists: true},
            };
            const context = {
                timesCounter: 5,
                userId: '',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should work with AND logical operator', async () => {
            const expression = {
                and: [
                    {userId: {exists: true}},
                    {userId: {regexpi: '^GROUP '}},
                ],
            };
            const context = {
                timesCounter: 5,
                userId: 'GROUP admin',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should work with AND logical operator - false case', async () => {
            const expression = {
                and: [
                    {userId: {exists: true}},
                    {userId: {regexpi: '^GROUP '}},
                ],
            };
            const context = {
                timesCounter: 5,
                userId: undefined,
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await evaluate(expression as any, context, {}, runOpts)).toEqual(false);
        });

    });

    describe(`lt`, () => {
        it('should evaluate lt compare op to true', async () => {
            const expression = {
                timesCounter: {lt: 5},
            };
            const context = {
                timesCounter: 3,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate ref lt compare op to true', async () => {
            const expression = {
                timesCounter: {lt: {ref: 'timesCounterRef' as const}},
            };
            const context = {
                timesCounter: 3,
                timesCounterRef: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate math ref lt compare op to true', async () => {
            const expression = {
                timesCounter: {lt: {op: '+' as const, rhs: {ref: 'timesCounterRef' as const}, lhs: 1}},
            };
            const context = {
                timesCounter: 3,
                timesCounterRef: 4,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate lt compare lt to false', async () => {
            const expression = {
                timesCounter: {lt: 5},
            };
            const context = {
                timesCounter: 8,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });

        it('should evaluate lt compare op to false 2', async () => {
            const expression = {
                timesCounter: {lt: 5},
            };
            const context = {
                timesCounter: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });
    });

    describe(`lte`, () => {
        it('should evaluate lte compare op to true', async () => {
            const expression = {
                timesCounter: {lte: 5},
            };
            const context = {
                timesCounter: 3,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate ref lte compare op to true', async () => {
            const expression = {
                timesCounter: {lte: {ref: 'timesCounterRef' as const}},
            };
            const context = {
                timesCounter: 3,
                timesCounterRef: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate math ref lte compare op to true', async () => {
            const expression = {
                timesCounter: {lte: {op: '%' as const, rhs: {ref: 'timesCounterRef' as const}, lhs: 17}},
            };
            const context = {
                timesCounter: 3,
                timesCounterRef: 6,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate lte compare op to true 2', async () => {
            const expression = {
                timesCounter: {lte: 5},
            };
            const context = {
                timesCounter: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate lte compare op to false', async () => {
            const expression = {
                timesCounter: {lte: 5},
            };
            const context = {
                timesCounter: 8,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });
    });

    it('should pass run opts to functions', async () => {
        const expression = {userComplex: 'r@a.com'};
        expect(await validate(expression, {
            userId: '-',
            timesCounter: 8,
        }, functionsTable, {dryRun: true})).toBeUndefined();
        await expect(validate(expression, {
            userId: '-',
            timesCounter: 8,
        }, functionsTable, {dryRun: false}))
            .rejects.toThrow('Failed user validation');
        expect(await evaluate(expression, {
            userId: 'r@a.com',
            timesCounter: 8,
        }, functionsTable, {dryRun: false})).toEqual(true);
        expect(await evaluate(expression, {
            userId: '-',
            timesCounter: 8,
        }, functionsTable, {dryRun: false})).toEqual(false);
        expect(await evaluate(expression, {
            userId: '-',
            timesCounter: 8,
        }, functionsTable, {dryRun: true})).toEqual(true);
    });

    it('should evaluate a single function', async () => {
        const expression = {user: 'r@a.com'};
        const context = {
            userId: 'r@a.com',
            timesCounter: 8,
        };
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
        expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
    });

    it('should evaluate a single not function to false', async () => {
        const expression = {not: {user: 'r@a.com'}};
        const context = {
            userId: 'r@a.com',
            timesCounter: 8,
        };
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
        expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
    });

    it('should evaluate a single not function to true', async () => {
        const expression = {not: {user: 'a@a.com'}};
        const context = {
            userId: 'r@a.com',
            timesCounter: 8,
        };
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
        expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
    });

    it('should evaluate a single and function to true', async () => {
        const expression = {and: [{user: 'r@a.com'}]};
        const context = {
            userId: 'r@a.com',
            timesCounter: 8,
        };
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
        expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
    });

    it('should evaluate a single or function to true', async () => {
        const expression = {or: [{user: 'r@a.com'}]};
        const context = {
            userId: 'r@a.com',
            timesCounter: 8,
        };
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
        expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
    });

    it('should evaluate a single and function to false', async () => {
        const expression = {and: [{user: 't@a.com'}]};
        const context = {
            userId: 'r@a.com',
            timesCounter: 8,
        };
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
        expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
    });

    it('should evaluate a single or function to false', async () => {
        const expression = {or: [{user: 't@a.com'}]};
        const context = {
            userId: 'r@a.com',
            timesCounter: 8,
        };
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
        expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
    });

    it('should fail on empty or op', async () => {
        const expression = {or: []};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - or operator must have at least one expression');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - or operator must have at least one expression');
    });

    it('should fail on empty and op', async () => {
        const expression = {and: []};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - and operator must have at least one expression');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - and operator must have at least one expression');
    });

    it('should fail on non existing property', async () => {
        const expression: any = {and: [{dummy: 1}]};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - unknown context key dummy');
        expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
    });

    it('should fail on non existing property ref', async () => {
        const expression: any = {and: [{userId: {eq: {ref: 'fsdf'}}}]};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - unknown context key fsdf');
        expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
    });

    it('should fail on non existing math op', async () => {
        const expression: any = {and: [{timesCounter: {eq: {op: 'y', lhs: 1, rhs: 2}}}]};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - timesCounter has invalid math operand y');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - timesCounter has invalid math operand y');
    });

    it('should fail on non number math parameter', async () => {
        const expression: any = {and: [{timesCounter: {eq: {op: '+', lhs: 1, rhs: {ref: 'userId'}}}}]};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - timesCounter must be a number');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - timesCounter must be a number');
    });

    it('should fail on non number math parameter 2', async () => {
        const expression: any = {and: [{timesCounter: {eq: {op: '+', rhs: 1, lhs: {ref: 'userId'}}}}]};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - timesCounter must be a number');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - timesCounter must be a number');
    });

    it('should fail on non existing nested property', async () => {
        const expression: any = {and: [{'dummy.value': 1}]};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - unknown context key dummy');
        expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
    });

    it('should fail on non existing nested property 2', async () => {
        const expression: any = {and: [{'dummy.value': 1}]};
        const context = {userId: 'r@a.com', timesCounter: 8, dummy: {value2: 5}};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - unknown context key dummy');
        expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
    });

    it('should fail on non existing property 2', async () => {
        const expression: any = {dummy: 1};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - unknown context key dummy');
        expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
    });

    it('should fail on non existing op', async () => {
        const expression: any = {userId: {bk: 1}};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - unknown op bk');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - unknown op bk');
    });

    it('should fail on non number op', async () => {
        const expression: any = {timesCounter: {gt: 'sdf'}};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - timesCounter must be a number');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - timesCounter must be a number');
    });

    it('should fail on non number op ref', async () => {
        const expression: any = {timesCounter: {gt: {ref: 'userId'}}};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - timesCounter must be a number');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - timesCounter must be a number');
    });

    it('should fail on non string op', async () => {
        const expression: any = {userId: {regexp: 5}};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - userId must be a string');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - userId must be a string');
    });

    it('should fail on non string context', async () => {
        const expression: any = {timesCounter: {regexp: 's'}};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid context - timesCounter must be a string');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid context - timesCounter must be a string');
    });

    it('should fail on non number context', async () => {
        const expression: any = {userId: {gte: 5}};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid context - userId must be a number');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid context - userId must be a number');
    });

    it('should fail too many keys to op', async () => {
        const expression: any = {userId: {eq: 1, nq: 2}};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - too may keys');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - too may keys');
    });

    it('should fail too many keys', async () => {
        const expression: any = {timesCounter: 1, userId: 'a'};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - too may keys');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - too may keys');
    });

    it('should fail too many keys 2', async () => {
        const expression: any = {or: [{userId: 1, timesCounter: 'a'}]};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - too may keys');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .rejects.toThrow('Invalid expression - too may keys');
    });

    describe('short circuit', () => {
        it('or is short circuiting', async () => {
            let fnCounter = 0;
            const fnTable = {
                eval: (arg: boolean): boolean => {
                    fnCounter++;
                    return arg;
                },
            };
            const expression = {
                or: [
                    {
                        eval: false,
                    },
                    {
                        eval: false,
                    },
                    {
                        eval: true,
                    },
                    {
                        eval: false,
                    },
                ],
            };
            const context = {};
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            await validate(expression, context, fnTable, runOpts);
            expect(fnCounter).toEqual(4);
            fnCounter = 0;
            await evaluate(expression, context, fnTable, runOpts);
            expect(fnCounter).toEqual(3);
        });

        it('and is short circuiting', async () => {
            let fnCounter = 0;
            const fnTable = {
                eval: (arg: boolean): boolean => {
                    fnCounter++;
                    return arg;
                },
            };
            const expression = {
                and: [
                    {
                        eval: true,
                    },
                    {
                        eval: true,
                    },
                    {
                        eval: false,
                    },
                    {
                        eval: true,
                    },
                ],
            };
            const context = {};
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            await validate<typeof context, typeof fnTable, Ignore, CustomEvaluatorFuncRunOptions>(
                expression, context, fnTable, runOpts);
            expect(fnCounter).toEqual(4);
            fnCounter = 0;
            await evaluate(expression, context, fnTable, runOpts);
            expect(fnCounter).toEqual(3);
        });
    });

    describe('evaluateWithReason', () => {
        it('should return result and reason for simple eq expression that is true', async () => {
            const expression = {
                timesCounter: 5,
            };
            const context = {
                timesCounter: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, functionsTable, runOpts);
            expect(result.result).toEqual(true);
            expect(result.reason).toEqual({timesCounter: 5});
            await verifyReasonEvaluatesToSameResult(result, context, functionsTable, runOpts);
        });

        it('should return result with reason for false expression', async () => {
            const expression = {
                timesCounter: 5,
            };
            const context = {
                timesCounter: 7,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, functionsTable, runOpts);
            expect(result.result).toEqual(false);
            expect(result.reason).toEqual({timesCounter: 5});
            await verifyReasonEvaluatesToSameResult(result, context, functionsTable, runOpts);
        });

        it('should return only the first matching expression in OR as reason', async () => {
            const expression = {
                or: [
                    {timesCounter: 10},  // false
                    {timesCounter: 5},   // true - should be the reason
                    {userId: 'a'},       // also true, but shouldn't be in reason
                ],
            };
            const context = {
                timesCounter: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, functionsTable, runOpts);
            expect(result.result).toEqual(true);
            expect(result.reason).toEqual({or: [{timesCounter: 5}]});
            await verifyReasonEvaluatesToSameResult(result, context, functionsTable, runOpts);
        });

        it('should return all matching expressions in AND as reason', async () => {
            const expression = {
                and: [
                    {timesCounter: 5},
                    {userId: 'a'},
                ],
            };
            const context = {
                timesCounter: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, functionsTable, runOpts);
            expect(result.result).toEqual(true);
            expect(result.reason).toEqual({and: [{timesCounter: 5}, {userId: 'a'}]});
            await verifyReasonEvaluatesToSameResult(result, context, functionsTable, runOpts);
        });

        it('should return reason when AND fails', async () => {
            const expression = {
                and: [
                    {timesCounter: 5},
                    {userId: 'b'},  // false - this is the reason
                ],
            };
            const context = {
                timesCounter: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, functionsTable, runOpts);
            expect(result.result).toEqual(false);
            expect(result.reason).toEqual({and: [{userId: 'b'}]});
            await verifyReasonEvaluatesToSameResult(result, context, functionsTable, runOpts);
        });

        it('should return reason for nested OR in AND', async () => {
            const expression = {
                and: [
                    {timesCounter: 5},
                    {
                        or: [
                            {userId: 'b'},  // false
                            {userId: 'a'},  // true - reason for the OR
                        ],
                    },
                ],
            };
            const context = {
                timesCounter: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, functionsTable, runOpts);
            expect(result.result).toEqual(true);
            expect(result.reason).toEqual({and: [{timesCounter: 5}, {or: [{userId: 'a'}]}]});
            await verifyReasonEvaluatesToSameResult(result, context, functionsTable, runOpts);
        });

        it('should return reason for NOT expression', async () => {
            const expression = {not: {user: 'a@a.com'}};
            const context = {
                userId: 'r@a.com',
                timesCounter: 8,
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, functionsTable, runOpts);
            expect(result.result).toEqual(true);
            expect(result.reason).toEqual({not: {user: 'a@a.com'}});
            await verifyReasonEvaluatesToSameResult(result, context, functionsTable, runOpts);
        });

        it('should return reason when NOT fails', async () => {
            const expression = {not: {user: 'r@a.com'}};
            const context = {
                userId: 'r@a.com',
                timesCounter: 8,
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, functionsTable, runOpts);
            expect(result.result).toEqual(false);
            // NOT is false because inner {user: 'r@a.com'} was true
            expect(result.reason).toEqual({not: {user: 'r@a.com'}});
            await verifyReasonEvaluatesToSameResult(result, context, functionsTable, runOpts);
        });

        it('should return minimal reason for NOT on AND (first failing condition)', async () => {
            const expression = {
                not: {
                    and: [
                        {userId: 'admin'},  // false - this alone makes AND false
                        {timesCounter: 5},
                    ],
                },
            };
            const context = {
                userId: 'john',
                timesCounter: 5,
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, functionsTable, runOpts);
            expect(result.result).toEqual(true);
            // Should return NOT of just the first failing condition, not the entire AND
            expect(result.reason).toEqual({not: {and: [{userId: 'admin'}]}});
            await verifyReasonEvaluatesToSameResult(result, context, functionsTable, runOpts);
        });

        it('should return minimal reason for NOT on OR (all failing conditions)', async () => {
            const expression = {
                not: {
                    or: [
                        {userId: 'admin'},
                        {userId: 'root'},
                    ],
                },
            };
            const context = {
                userId: 'john',
                timesCounter: 5,
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, functionsTable, runOpts);
            expect(result.result).toEqual(true);
            // OR is false because all conditions failed, so the reason includes all
            expect(result.reason).toEqual({not: {or: [{userId: 'admin'}, {userId: 'root'}]}});
            await verifyReasonEvaluatesToSameResult(result, context, functionsTable, runOpts);
        });

        it('should return minimal reason for nested NOT on AND with nested OR', async () => {
            const expression = {
                not: {
                    and: [
                        {
                            or: [
                                {userId: 'admin'},
                                {userId: 'root'},
                            ],
                        },
                        {timesCounter: 5},
                    ],
                },
            };
            const context = {
                userId: 'john',
                timesCounter: 5,
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, functionsTable, runOpts);
            expect(result.result).toEqual(true);
            // AND failed because the nested OR failed (first condition in AND)
            expect(result.reason).toEqual({not: {and: [{or: [{userId: 'admin'}, {userId: 'root'}]}]}});
            await verifyReasonEvaluatesToSameResult(result, context, functionsTable, runOpts);
        });

        it('should handle triple NOT correctly', async () => {
            const expression = {
                not: {
                    not: {
                        not: {userId: 'admin'},
                    },
                },
            };
            const context = {
                userId: 'john',
                timesCounter: 5,
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, functionsTable, runOpts);
            // !(!(!false)) = !(!(true)) = !false = true
            expect(result.result).toEqual(true);
            expect(result.reason).toEqual({not: {not: {not: {userId: 'admin'}}}});
            await verifyReasonEvaluatesToSameResult(result, context, functionsTable, runOpts);
        });

        it('should handle deep expression with multiple NOTs at different levels', async () => {
            const expression = {
                and: [
                    {
                        not: {
                            or: [
                                {userId: 'admin'},
                                {userId: 'root'},
                            ],
                        },
                    },
                    {
                        not: {userId: 'guest'},
                    },
                    {
                        or: [
                            {not: {timesCounter: 100}},
                            {userId: 'john'},
                        ],
                    },
                ],
            };
            const context = {
                userId: 'john',
                timesCounter: 5,
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, functionsTable, runOpts);
            expect(result.result).toEqual(true);
            // All AND conditions are true:
            // 1. NOT(OR) is true because OR(admin, root) is false
            // 2. NOT(guest) is true because userId != guest
            // 3. OR short-circuits on first NOT(100) which is true
            expect(result.reason).toEqual({
                and: [
                    {not: {or: [{userId: 'admin'}, {userId: 'root'}]}},
                    {not: {userId: 'guest'}},
                    {or: [{not: {timesCounter: 100}}]},
                ],
            });
            await verifyReasonEvaluatesToSameResult(result, context, functionsTable, runOpts);
        });

        it('should handle NOT inside OR inside NOT', async () => {
            const expression = {
                not: {
                    or: [
                        {not: {userId: 'john'}},  // false because userId IS john
                        {userId: 'admin'},        // false
                    ],
                },
            };
            const context = {
                userId: 'john',
                timesCounter: 5,
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, functionsTable, runOpts);
            // OR is false (both conditions false), so NOT(OR) is true
            expect(result.result).toEqual(true);
            // falseReason of OR contains both failing conditions
            expect(result.reason).toEqual({
                not: {
                    or: [
                        {not: {userId: 'john'}},
                        {userId: 'admin'},
                    ],
                },
            });
            await verifyReasonEvaluatesToSameResult(result, context, functionsTable, runOpts);
        });

        it('should return reason for user function that returns true', async () => {
            const expression = {user: 'r@a.com'};
            const context = {
                userId: 'r@a.com',
                timesCounter: 8,
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, functionsTable, runOpts);
            expect(result.result).toEqual(true);
            expect(result.reason).toEqual({user: 'r@a.com'});
            await verifyReasonEvaluatesToSameResult(result, context, functionsTable, runOpts);
        });

        it('should return reason for user function that returns false', async () => {
            const expression = {user: 'a@a.com'};
            const context = {
                userId: 'r@a.com',
                timesCounter: 8,
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, functionsTable, runOpts);
            expect(result.result).toEqual(false);
            expect(result.reason).toEqual({user: 'a@a.com'});
            await verifyReasonEvaluatesToSameResult(result, context, functionsTable, runOpts);
        });

        it('should return reason for complex nested expression', async () => {
            const expression = {
                or: [
                    {
                        and: [
                            {timesCounter: 10},  // false
                            {userId: 'a'},
                        ],
                    },
                    {
                        and: [
                            {timesCounter: 5},   // true
                            {userId: 'a'},       // true
                        ],
                    },
                ],
            };
            const context = {
                timesCounter: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, functionsTable, runOpts);
            expect(result.result).toEqual(true);
            // The reason should be the second AND block that evaluated to true
            expect(result.reason).toEqual({or: [{and: [{timesCounter: 5}, {userId: 'a'}]}]});
            await verifyReasonEvaluatesToSameResult(result, context, functionsTable, runOpts);
        });

        it('should work with ExpressionHandler.evaluateWithReason', async () => {
            const expression = {
                or: [
                    {timesCounter: 10},
                    {timesCounter: 5},
                ],
            };
            type Con = {
                timesCounter: number;
                userId: string;
            };
            const context = {
                timesCounter: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const exp = new ExpressionHandler<Con, typeof functionsTable, never, CustomEvaluatorFuncRunOptions>(
                expression, functionsTable);
            const result = await exp.evaluateWithReason(context, runOpts);
            expect(result.result).toEqual(true);
            expect(result.reason).toEqual({or: [{timesCounter: 5}]});
            await verifyReasonEvaluatesToSameResult(result, context, functionsTable, runOpts);
        });

        it('should return reason for gt operator', async () => {
            const expression = {
                timesCounter: {gt: 3},
            };
            const context = {
                timesCounter: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, functionsTable, runOpts);
            expect(result.result).toEqual(true);
            expect(result.reason).toEqual({timesCounter: {gt: 3}});
            await verifyReasonEvaluatesToSameResult(result, context, functionsTable, runOpts);
        });

        it('should return reason for between operator', async () => {
            const expression = {
                timesCounter: {between: [3, 10] as const},
            };
            const context = {
                timesCounter: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, functionsTable, runOpts);
            expect(result.result).toEqual(true);
            expect(result.reason).toEqual({timesCounter: {between: [3, 10]}});
            await verifyReasonEvaluatesToSameResult(result, context, functionsTable, runOpts);
        });

        it('should return reason for inq operator', async () => {
            const expression = {
                timesCounter: {inq: [3, 5, 7]},
            };
            const context = {
                timesCounter: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, functionsTable, runOpts);
            expect(result.result).toEqual(true);
            expect(result.reason).toEqual({timesCounter: {inq: [3, 5, 7]}});
            await verifyReasonEvaluatesToSameResult(result, context, functionsTable, runOpts);
        });

        it('should return reason for regexp operator', async () => {
            const expression = {
                userId: {regexp: '^a'},
            };
            const context = {
                timesCounter: 5,
                userId: 'abc',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, functionsTable, runOpts);
            expect(result.result).toEqual(true);
            expect(result.reason).toEqual({userId: {regexp: '^a'}});
            await verifyReasonEvaluatesToSameResult(result, context, functionsTable, runOpts);
        });

        it('should return reason for exists operator', async () => {
            const expression = {
                userId: {exists: true},
            };
            const context = {
                timesCounter: 5,
                userId: 'a',
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, functionsTable, runOpts);
            expect(result.result).toEqual(true);
            expect(result.reason).toEqual({userId: {exists: true}});
            await verifyReasonEvaluatesToSameResult(result, context, functionsTable, runOpts);
        });

        it('should short-circuit OR and return first matching reason', async () => {
            let fnCounter = 0;
            const fnTable = {
                eval: (arg: boolean): boolean => {
                    fnCounter++;
                    return arg;
                },
            };
            const expression = {
                or: [
                    {eval: false},
                    {eval: true},
                    {eval: true},  // should not be evaluated due to short-circuit
                ],
            };
            const context = {};
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, fnTable, runOpts);
            expect(result.result).toEqual(true);
            expect(result.reason).toEqual({or: [{eval: true}]});
            expect(fnCounter).toEqual(2);  // short-circuited at second expression
            await verifyReasonEvaluatesToSameResult(result, context, fnTable, runOpts);
        });

        it('should short-circuit AND and return reason on first false', async () => {
            let fnCounter = 0;
            const fnTable = {
                eval: (arg: boolean): boolean => {
                    fnCounter++;
                    return arg;
                },
            };
            const expression = {
                and: [
                    {eval: true},
                    {eval: false},
                    {eval: true},  // should not be evaluated due to short-circuit
                ],
            };
            const context = {};
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, fnTable, runOpts);
            expect(result.result).toEqual(false);
            expect(result.reason).toEqual({and: [{eval: false}]});
            expect(fnCounter).toEqual(2);  // short-circuited at second expression
            await verifyReasonEvaluatesToSameResult(result, context, fnTable, runOpts);
        });

        it('should fail on empty or op', async () => {
            const expression = {or: []} as any;
            const context = {userId: 'r@a.com', timesCounter: 8};
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            await expect(evaluateWithReason(expression, context, functionsTable, runOpts))
                .rejects.toThrow('Invalid expression - or operator must have at least one expression');
        });

        it('should fail on empty and op', async () => {
            const expression = {and: []} as any;
            const context = {userId: 'r@a.com', timesCounter: 8};
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            await expect(evaluateWithReason(expression, context, functionsTable, runOpts))
                .rejects.toThrow('Invalid expression - and operator must have at least one expression');
        });

        it('should fail on too many keys', async () => {
            const expression = {timesCounter: 1, userId: 'a'} as any;
            const context = {userId: 'r@a.com', timesCounter: 8};
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            await expect(evaluateWithReason(expression, context, functionsTable, runOpts))
                .rejects.toThrow('Invalid expression - too may keys');
        });

        it('should return false with reason for non-existing property', async () => {
            const expression = {nonExistent: 1} as any;
            const context = {userId: 'r@a.com', timesCounter: 8};
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const result = await evaluateWithReason(expression, context, functionsTable, runOpts);
            expect(result.result).toEqual(false);
            expect(result.reason).toEqual({nonExistent: 1});
            await verifyReasonEvaluatesToSameResult(result, context, functionsTable, runOpts);
        });
    });

    describe('Record with union types including arrays', () => {
        it('should evaluate recordNested.a with short eq to true', async () => {
            const expression = {
                'recordNested.a': 5,
            };
            type Context = {
                timesCounter: number;
                userId: string;
                recordNested?: Record<string, string | boolean | number | undefined>;
            };
            const context: Context = {
                timesCounter: 5,
                userId: 'user@example.com',
                recordNested: {
                    a: 5,
                },
            };
            const validationContext = {
                timesCounter: 5,
                userId: 'user@example.com',
                recordNested: {
                    a: 5,
                },
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, validationContext, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate recordNested.a with ref', async () => {
            const expression = {
                'recordNested.a': {eq: {ref: 'recordNested.a' as const}},
            };
            type Context = {
                timesCounter: number;
                userId: string;
                recordNested?: Record<string, string | boolean | number | undefined>;
            };
            const context: Context = {
                timesCounter: 5,
                userId: 'user@example.com',
                recordNested: {
                    a: 5,
                },
            };
            const validationContext = {
                timesCounter: 5,
                userId: 'user@example.com',
                recordNested: {
                    a: 5,
                },
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, validationContext, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate recordNested.a with short eq to false', async () => {
            const expression = {
                'recordNested.a': 5,
            };
            type Context = {
                timesCounter: number;
                userId: string;
                recordNested?: Record<string, string | boolean | number | undefined>;
            };
            const context: ValidationContext<Context> = {
                timesCounter: 5,
                userId: 'user@example.com',
                recordNested: {
                    a: 10,
                },
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(false);
        });

        it('should evaluate specialNested.a with short eq to true (ignoring array type)', async () => {
            const expression = {
                'specialNested.a': 5,
            };
            type Context = {
                timesCounter: number;
                userId: string;
                specialNested?: Record<string, string | boolean | number | undefined |
                    (string | boolean | number | (string | boolean | number)[])[]>;
            };
            const context:ValidationContext<Context> = {
                timesCounter: 5,
                userId: 'user@example.com',
                specialNested: {
                    a: 5,
                },
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate specialNested.a with ref', async () => {
            const expression = {
                'specialNested.a': {eq: {ref: 'specialNested.a' as const}},
            };
            type Context = {
                timesCounter: number;
                userId: string;
                specialNested?: Record<string, string | boolean | number | undefined |
                    (string | boolean | number | (string | boolean | number)[])[]>;
            };
            const context: ValidationContext<Context> = {
                timesCounter: 5,
                userId: 'user@example.com',
                specialNested: {
                    a: 5,
                },
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate specialNested.a with eq operator to true', async () => {
            const expression = {
                'specialNested.a': {eq: 5},
            };
            type Context = {
                timesCounter: number;
                userId: string;
                specialNested?: Record<string, string | boolean | number | undefined |
                    (string | boolean | number | (string | boolean | number)[])[]>;
            };
            const context:ValidationContext<Context> = {
                timesCounter: 5,
                userId: 'user@example.com',
                specialNested: {
                    a: 5,
                },
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate specialNested.b with gt operator to true', async () => {
            const expression = {
                'specialNested.b': {gt: 10},
            };
            type Context = {
                timesCounter: number;
                userId: string;
                specialNested?: Record<string, string | boolean | number | undefined |
                    (string | boolean | number | (string | boolean | number)[])[]>;
            };
            const context:ValidationContext<Context> = {
                timesCounter: 5,
                userId: 'user@example.com',
                specialNested: {
                    b: 15,
                },
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate specialNested.name with regexp operator to true', async () => {
            const expression = {
                'specialNested.name': {regexp: '^test'},
            };
            type Context = {
                timesCounter: number;
                userId: string;
                specialNested?: Record<string, string | boolean | number | undefined |
                    (string | boolean | number | (string | boolean | number)[])[]>;
            };
            const context:ValidationContext<Context> = {
                timesCounter: 5,
                userId: 'user@example.com',
                specialNested: {
                    name: 'test123',
                },
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate specialNested.id with inq operator to true', async () => {
            const expression = {
                'specialNested.id': {inq: [1, 2, 3]},
            };
            type Context = {
                timesCounter: number;
                userId: string;
                specialNested?: Record<string, string | boolean | number | undefined |
                    (string | boolean | number | (string | boolean | number)[])[]>;
            };
            const context:ValidationContext<Context> = {
                timesCounter: 5,
                userId: 'user@example.com',
                specialNested: {
                    id: 2,
                },
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should evaluate recordNested.status with boolean value to true', async () => {
            const expression = {
                'recordNested.status': true,
            };
            type Context = {
                timesCounter: number;
                userId: string;
                recordNested?: Record<string, string | boolean | number | undefined>;
            };
            const context:ValidationContext<Context> = {
                timesCounter: 5,
                userId: 'user@example.com',
                recordNested: {
                    status: true,
                },
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, context, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });

        it('should work with or operator combining specialNested paths', async () => {
            const expression = {
                or: [
                    {'specialNested.a': 5},
                    {'specialNested.b': {gt: 10}},
                ],
            };
            type Context = {
                timesCounter: number;
                userId: string;
                specialNested?: Record<string, string | boolean | number | undefined |
                    (string | boolean | number | (string | boolean | number)[])[]>;
            };
            const validationContext: ValidationContext<Context> = {
                timesCounter: 5,
                userId: 'user@example.com',
                specialNested: {
                    a: 3,
                    b: 15,
                },
            };

            const context: Context = {
                timesCounter: 5,
                userId: 'user@example.com',
                specialNested: {
                    a: 3,
                    b: 15,
                },
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            expect(await validate(expression, validationContext, functionsTable, runOpts)).toBeUndefined();
            expect(await evaluate(expression, context, functionsTable, runOpts)).toEqual(true);
        });
    });

});
