import * as chai from 'chai';
import {expect} from 'chai';
import {ValidationContext, RulesEngine, Rule, validateRules, evaluateRules} from '../';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

const functionsTable = {
    user: (user: string, context: { userId: string }): boolean => {
        return context.userId === user;
    },
};

const ruleFunctionsTable = {
    userRule: (user: string, context: { userId: string }): void | {
        message: string;
        custom: number;
    } => {
        if (context.userId === user) {
            return {
                message: `Username ${user} is not allowed`,
                custom: 543,
            }
        }
    },
};

type ExpressionFunction = typeof functionsTable;
type RuleFunction = typeof ruleFunctionsTable;

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
        const rules: Rule<number, RuleFunction, Con, ExpressionFunction>[] = [
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
        const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction>
        (functionsTable, ruleFunctionsTable);
        await expect(engine.validate(rules, validationContext))
            .to.eventually.rejectedWith(Error, 'Missing condition for rule');
        await expect(validateRules<number, Con, RuleFunction, ExpressionFunction>(rules, validationContext,
            functionsTable, ruleFunctionsTable))
            .to.eventually.rejectedWith(Error, 'Missing condition for rule');
        await expect(evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
            , ruleFunctionsTable, true)).to.eventually.rejectedWith(Error, 'Missing condition for rule');
        await expect(evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
            , ruleFunctionsTable, false)).to.eventually.rejectedWith(Error, 'Missing condition for rule');
        await expect(engine.evaluate(rules, context)).to.eventually.rejectedWith(Error, 'Missing condition for rule');
        await expect(engine.evaluateAll(rules, context)).to.eventually
            .rejectedWith(Error, 'Missing condition for rule');
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
        const rules: Rule<number, RuleFunction, Con, ExpressionFunction>[] = [
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
        const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction>
        (functionsTable, ruleFunctionsTable);
        await expect(engine.validate(rules, validationContext))
            .to.eventually.rejectedWith(Error, 'Missing consequence for rule');
        await expect(validateRules<number, Con, RuleFunction, ExpressionFunction>(rules, validationContext,
            functionsTable, ruleFunctionsTable))
            .to.eventually.rejectedWith(Error, 'Missing consequence for rule');
        await expect(evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
            , ruleFunctionsTable, true)).to.eventually.rejectedWith(Error, 'Missing consequence for rule');
        await expect(evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
            , ruleFunctionsTable, false)).to.eventually.rejectedWith(Error, 'Missing consequence for rule');
        await expect(engine.evaluate(rules, context)).to.eventually.rejectedWith(Error, 'Missing consequence for rule');
        await expect(engine.evaluateAll(rules, context)).to
            .eventually.rejectedWith(Error, 'Missing consequence for rule');
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
        const rules: Rule<number, RuleFunction, Con, ExpressionFunction>[] = [
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
        const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction>
        (functionsTable, ruleFunctionsTable);
        await expect(engine.validate(rules, validationContext))
            .to.eventually.rejectedWith(Error, 'Invalid expression - unknown context key userIds');
        await expect(validateRules<number, Con, RuleFunction, ExpressionFunction>(rules, validationContext,
            functionsTable, ruleFunctionsTable))
            .to.eventually.rejectedWith(Error, 'Invalid expression - unknown context key userIds');
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
        const rules: Rule<number, RuleFunction, Con, ExpressionFunction>[] = [
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
        const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction>
        (functionsTable, ruleFunctionsTable);
        await expect(engine.validate(rules, validationContext))
            .to.eventually.rejectedWith(Error, 'Invalid consequence ref - unknown context key userIdd');
        await expect(validateRules<number, Con, RuleFunction, ExpressionFunction>(rules, validationContext,
            functionsTable, ruleFunctionsTable))
            .to.eventually.rejectedWith(Error, 'Invalid consequence ref - unknown context key userIdd');
        await expect(evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
            , ruleFunctionsTable, true)).to.eventually.rejectedWith(Error, 'Invalid consequence ref - unknown context key userIdd');
        await expect(evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
            , ruleFunctionsTable, false)).to.eventually.rejectedWith(Error, 'Invalid consequence ref - unknown context key userIdd');
        await expect(engine.evaluate(rules, context)).to.eventually.rejectedWith(Error, 'Invalid consequence ref - unknown context key userIdd');
        await expect(engine.evaluateAll(rules, context)).to
            .eventually.rejectedWith(Error, 'Invalid consequence ref - unknown context key userIdd');
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
        const rules: Rule<number, RuleFunction, Con, ExpressionFunction>[] = [
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
        const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction>
        (functionsTable, ruleFunctionsTable);
        expect(await engine.validate(rules, validationContext)).to.be.an('undefined');
        expect(await validateRules<number, Con, RuleFunction, ExpressionFunction>(rules, validationContext,
            functionsTable, ruleFunctionsTable)).to.be.an('undefined');
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
            , ruleFunctionsTable, true)).to.eql(undefined);
        expect(await engine.evaluate(rules, context)).to.eql(undefined);
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
            , ruleFunctionsTable, false)).to.eql(undefined);
        expect(await engine.evaluateAll(rules, context)).to.eql(undefined);
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
        const rules: Rule<number, RuleFunction, Con, ExpressionFunction>[] = [
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
        const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction>
        (functionsTable, ruleFunctionsTable);
        expect(await engine.validate(rules, validationContext)).to.be.an('undefined');
        expect(await validateRules<number, Con, RuleFunction, ExpressionFunction>(rules, validationContext,
            functionsTable, ruleFunctionsTable)).to.be.an('undefined');
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
            , ruleFunctionsTable, true)).to.eql([{
            'custom': 578,
            'message': 'nested value 7 should not equal 7 days',
        }]);
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
            , ruleFunctionsTable, false)).to.eql([{
            'custom': 578,
            'message': 'nested value 7 should not equal 7 days',
        }]);
        expect(await engine.evaluate(rules, context)).to.eql({
            'custom': 578,
            'message': 'nested value 7 should not equal 7 days',
        });
        expect(await engine.evaluateAll(rules, context)).to.eql([{
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
        const rules: Rule<number, RuleFunction, Con, ExpressionFunction>[] = [
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
        const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction>
        (functionsTable, ruleFunctionsTable);
        expect(await engine.validate(rules, validationContext)).to.be.an('undefined');
        expect(await validateRules<number, Con, RuleFunction, ExpressionFunction>(rules, validationContext,
            functionsTable, ruleFunctionsTable)).to.be.an('undefined');
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
            , ruleFunctionsTable, true)).to.eql([{
            'custom': 543,
            'message': 'Username a is not allowed',
        }]);
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
            , ruleFunctionsTable, false)).to.eql([{
            'custom': 543,
            'message': 'Username a is not allowed',
        }]);
        expect(await engine.evaluate(rules, context)).to.eql({
            'custom': 543,
            'message': 'Username a is not allowed',
        });
        expect(await engine.evaluateAll(rules, context)).to.eql([{
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
        const rules: Rule<number, RuleFunction, Con, ExpressionFunction>[] = [
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
        const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction>
        (functionsTable, ruleFunctionsTable);
        expect(await engine.validate(rules, validationContext)).to.be.an('undefined');
        expect(await validateRules<number, Con, RuleFunction, ExpressionFunction>(rules, validationContext,
            functionsTable, ruleFunctionsTable)).to.be.an('undefined');
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
            , ruleFunctionsTable, true)).to.eql([{
            'custom': 579,
            'message': 'user a should not equal a',
        }]);
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
            , ruleFunctionsTable, false)).to.eql([{
            'custom': 579,
            'message': 'user a should not equal a',
        }]);
        expect(await engine.evaluate(rules, context)).to.eql({
            'custom': 579,
            'message': 'user a should not equal a',
        });
        expect(await engine.evaluateAll(rules, context)).to.eql([{
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
        const rules: Rule<number, RuleFunction, Con, ExpressionFunction>[] = [
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
        const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction>
        (functionsTable, ruleFunctionsTable);
        expect(await engine.validate(rules, validationContext)).to.be.an('undefined');
        expect(await validateRules<number, Con, RuleFunction, ExpressionFunction>(rules, validationContext,
            functionsTable, ruleFunctionsTable)).to.be.an('undefined');
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
            , ruleFunctionsTable, true)).to.eql([{
            'custom': 579,
            'message': 'user should not equal a',
        }]);
        expect(await evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
            , ruleFunctionsTable, false)).to.eql([
            {
                'custom': 579,
                'message': 'user should not equal a',
            },
            {
                'custom': 543,
                'message': 'Username a is not allowed',
            },
        ]);
        expect(await engine.evaluate(rules, context)).to.eql({
            'custom': 579,
            'message': 'user should not equal a',
        });
        expect(await engine.evaluateAll(rules, context)).to.eql([
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