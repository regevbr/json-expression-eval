import * as chai from 'chai';
import {expect} from 'chai';
import {evaluate, ExpressionHandler, validate} from '../';
import  chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

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
            expect(await exp.validate(validationContext, runOpts)).to.be.an('undefined');
            expect(await validate<Con, ExpressionFunction, Ignore, CustomEvaluatorFuncRunOptions>(
                expression, validationContext, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
            expect(await exp.evaluate(context, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
        });

        it('should fail on empty between compare op', async () => {
            const expression = {
                timesCounter: {between: [] as any},
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const context = {userId: 'r@a.com', timesCounter: 8};
            await expect(validate(expression, context, functionsTable, runOpts))
                .to.eventually.rejectedWith(Error, 'Invalid expression - timesCounter.length must be 2');
            await expect(evaluate(expression, context, functionsTable, runOpts))
                .to.eventually.rejectedWith(Error, 'Invalid expression - timesCounter.length must be 2');
        });

        it('should fail on single value between compare op', async () => {
            const expression = {
                timesCounter: {between: [1] as any},
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const context = {userId: 'r@a.com', timesCounter: 8};
            await expect(validate(expression, context, functionsTable, runOpts))
                .to.eventually.rejectedWith(Error, 'Invalid expression - timesCounter.length must be 2');
            await expect(evaluate(expression, context, functionsTable, runOpts))
                .to.eventually.rejectedWith(Error, 'Invalid expression - timesCounter.length must be 2');
        });

        it('should fail on too many values value between compare op', async () => {
            const expression = {
                timesCounter: {between: [1, 2, 3] as any},
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const context = {userId: 'r@a.com', timesCounter: 8};
            await expect(validate(expression, context, functionsTable, runOpts))
                .to.eventually.rejectedWith(Error, 'Invalid expression - timesCounter.length must be 2');
            await expect(evaluate(expression, context, functionsTable, runOpts))
                .to.eventually.rejectedWith(Error, 'Invalid expression - timesCounter.length must be 2');
        });

        it('should fail on non number value between compare op', async () => {
            const expression = {
                timesCounter: {between: ['s', 4] as any},
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const context = {userId: 'r@a.com', timesCounter: 8};
            await expect(validate(expression, context, functionsTable, runOpts))
                .to.eventually.rejectedWith(Error, 'Invalid expression - timesCounter[0] must be a number');
            await expect(evaluate(expression, context, functionsTable, runOpts))
                .to.eventually.rejectedWith(Error, 'Invalid expression - timesCounter[0] must be a number');
        });

        it('should fail on non number value between compare op 2', async () => {
            const expression = {
                timesCounter: {between: [4, 's'] as any},
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const context = {userId: 'r@a.com', timesCounter: 8};
            await expect(validate(expression, context, functionsTable, runOpts))
                .to.eventually.rejectedWith(Error, 'Invalid expression - timesCounter[1] must be a number');
            await expect(evaluate(expression, context, functionsTable, runOpts))
                .to.eventually.rejectedWith(Error, 'Invalid expression - timesCounter[1] must be a number');
        });

        it('should fail on bad high/low values between compare op', async () => {
            const expression = {
                timesCounter: {between: [4, 3] as any},
            };
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            const context = {userId: 'r@a.com', timesCounter: 8};
            await expect(validate(expression, context, functionsTable, runOpts))
                .to.eventually.rejectedWith(Error, 'Invalid expression - timesCounter first value is higher than second value');
            await expect(evaluate(expression, context, functionsTable, runOpts))
                .to.eventually.rejectedWith(Error, 'Invalid expression - timesCounter first value is higher than second value');
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
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
            expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
            expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
        });
    });

    it('should pass run opts to functions', async () => {
        const expression = {userComplex: 'r@a.com'};
        expect(await validate(expression, {
            userId: '-',
            timesCounter: 8,
        }, functionsTable, {dryRun: true})).to.be.an('undefined');
        await expect(validate(expression, {
            userId: '-',
            timesCounter: 8,
        }, functionsTable, {dryRun: false}))
            .to.eventually.rejectedWith(Error, 'Failed user validation');
        expect(await evaluate(expression, {
            userId: 'r@a.com',
            timesCounter: 8,
        }, functionsTable, {dryRun: false})).to.eql(true);
        expect(await evaluate(expression, {
            userId: '-',
            timesCounter: 8,
        }, functionsTable, {dryRun: false})).to.eql(false);
        expect(await evaluate(expression, {
            userId: '-',
            timesCounter: 8,
        }, functionsTable, {dryRun: true})).to.eql(true);
    });

    it('should evaluate a single function', async () => {
        const expression = {user: 'r@a.com'};
        const context = {
            userId: 'r@a.com',
            timesCounter: 8,
        };
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
        expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
    });

    it('should evaluate a single not function to false', async () => {
        const expression = {not: {user: 'r@a.com'}};
        const context = {
            userId: 'r@a.com',
            timesCounter: 8,
        };
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
        expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
    });

    it('should evaluate a single not function to true', async () => {
        const expression = {not: {user: 'a@a.com'}};
        const context = {
            userId: 'r@a.com',
            timesCounter: 8,
        };
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
        expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
    });

    it('should evaluate a single and function to true', async () => {
        const expression = {and: [{user: 'r@a.com'}]};
        const context = {
            userId: 'r@a.com',
            timesCounter: 8,
        };
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
        expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
    });

    it('should evaluate a single or function to true', async () => {
        const expression = {or: [{user: 'r@a.com'}]};
        const context = {
            userId: 'r@a.com',
            timesCounter: 8,
        };
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
        expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(true);
    });

    it('should evaluate a single and function to false', async () => {
        const expression = {and: [{user: 't@a.com'}]};
        const context = {
            userId: 'r@a.com',
            timesCounter: 8,
        };
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
        expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
    });

    it('should evaluate a single or function to false', async () => {
        const expression = {or: [{user: 't@a.com'}]};
        const context = {
            userId: 'r@a.com',
            timesCounter: 8,
        };
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        expect(await validate(expression, context, functionsTable, runOpts)).to.be.an('undefined');
        expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
    });

    it('should fail on empty or op', async () => {
        const expression = {or: []};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - or operator must have at least one expression');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - or operator must have at least one expression');
    });

    it('should fail on empty and op', async () => {
        const expression = {and: []};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - and operator must have at least one expression');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - and operator must have at least one expression');
    });

    it('should fail on non existing property', async () => {
        const expression: any = {and: [{dummy: 1}]};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - unknown context key dummy');
        expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
    });

    it('should fail on non existing property ref', async () => {
        const expression: any = {and: [{userId: {eq: {ref: 'fsdf'}}}]};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - unknown context key fsdf');
        expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
    });

    it('should fail on non existing math op', async () => {
        const expression: any = {and: [{timesCounter: {eq: {op: 'y', lhs: 1, rhs: 2}}}]};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - timesCounter has invalid math operand y');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - timesCounter has invalid math operand y');
    });

    it('should fail on non number math parameter', async () => {
        const expression: any = {and: [{timesCounter: {eq: {op: '+', lhs: 1, rhs: {ref: 'userId'}}}}]};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - timesCounter must be a number');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - timesCounter must be a number');
    });

    it('should fail on non number math parameter 2', async () => {
        const expression: any = {and: [{timesCounter: {eq: {op: '+', rhs: 1, lhs: {ref: 'userId'}}}}]};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - timesCounter must be a number');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - timesCounter must be a number');
    });

    it('should fail on non existing nested property', async () => {
        const expression: any = {and: [{'dummy.value': 1}]};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - unknown context key dummy');
        expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
    });

    it('should fail on non existing nested property 2', async () => {
        const expression: any = {and: [{'dummy.value': 1}]};
        const context = {userId: 'r@a.com', timesCounter: 8, dummy: {value2: 5}};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - unknown context key dummy');
        expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
    });

    it('should fail on non existing property 2', async () => {
        const expression: any = {dummy: 1};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - unknown context key dummy');
        expect(await evaluate(expression, context, functionsTable, runOpts)).to.eql(false);
    });

    it('should fail on non existing op', async () => {
        const expression: any = {userId: {bk: 1}};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - unknown op bk');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - unknown op bk');
    });

    it('should fail on non number op', async () => {
        const expression: any = {timesCounter: {gt: 'sdf'}};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - timesCounter must be a number');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - timesCounter must be a number');
    });

    it('should fail on non number op ref', async () => {
        const expression: any = {timesCounter: {gt: {ref: 'userId'}}};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - timesCounter must be a number');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - timesCounter must be a number');
    });

    it('should fail on non string op', async () => {
        const expression: any = {userId: {regexp: 5}};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - userId must be a string');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - userId must be a string');
    });

    it('should fail on non string context', async () => {
        const expression: any = {timesCounter: {regexp: 's'}};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid context - timesCounter must be a string');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid context - timesCounter must be a string');
    });

    it('should fail on non number context', async () => {
        const expression: any = {userId: {gte: 5}};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid context - userId must be a number');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid context - userId must be a number');
    });

    it('should fail too many keys to op', async () => {
        const expression: any = {userId: {eq: 1, nq: 2}};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - too may keys');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - too may keys');
    });

    it('should fail too many keys', async () => {
        const expression: any = {timesCounter: 1, userId: 'a'};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - too may keys');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - too may keys');
    });

    it('should fail too many keys 2', async () => {
        const expression: any = {or: [{userId: 1, timesCounter: 'a'}]};
        const context = {userId: 'r@a.com', timesCounter: 8};
        const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
        await expect(validate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - too may keys');
        await expect(evaluate(expression, context, functionsTable, runOpts))
            .to.eventually.rejectedWith(Error, 'Invalid expression - too may keys');
    });

    describe('short circuit', () => {
        it('or is short circuiting', async () => {
            let fnCounter = 0;
            const fnTable = {
                eval: (arg: boolean): boolean => {
                    fnCounter++;
                    return arg
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
            const runOpts: CustomEvaluatorFuncRunOptions = {dryRun: false};
            await validate(expression, context, fnTable, runOpts);
            expect(fnCounter).to.eql(4);
            fnCounter = 0;
            await evaluate(expression, context, fnTable, runOpts);
            expect(fnCounter).to.eql(3);
        });

        it('and is short circuiting', async () => {
            let fnCounter = 0;
            const fnTable = {
                eval: (arg: boolean): boolean => {
                    fnCounter++;
                    return arg
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
            expect(fnCounter).to.eql(4);
            fnCounter = 0;
            await evaluate(expression, context, fnTable, runOpts);
            expect(fnCounter).to.eql(3);
        });
    });

});
