import {expect} from 'chai';
import {ValidationContext, RulesEngine, Rule, validateRules, evaluateRules} from '../';

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

  it('should fail on empty condition', () => {
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
    const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction>(functionsTable, ruleFunctionsTable);
    expect(() => engine.validate(rules, validationContext))
      .to.throw('Missing condition for rule');
    expect(() => validateRules<number, Con, RuleFunction, ExpressionFunction>(rules, validationContext,
      functionsTable, ruleFunctionsTable))
      .to.throw('Missing condition for rule');
    expect(() => evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
      , ruleFunctionsTable, true)).to.throw('Missing condition for rule');
    expect(() => evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
      , ruleFunctionsTable, false)).to.throw('Missing condition for rule');
    expect(() => engine.evaluate(rules, context)).to.throw('Missing condition for rule');
    expect(() => engine.evaluateAll(rules, context)).to.throw('Missing condition for rule');
  });

  it('should fail on empty consequence', () => {
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
    const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction>(functionsTable, ruleFunctionsTable);
    expect(() => engine.validate(rules, validationContext))
      .to.throw('Missing consequence for rule');
    expect(() => validateRules<number, Con, RuleFunction, ExpressionFunction>(rules, validationContext,
      functionsTable, ruleFunctionsTable))
      .to.throw('Missing consequence for rule');
    expect(() => evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
      , ruleFunctionsTable, true)).to.throw('Missing consequence for rule');
    expect(() => evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
      , ruleFunctionsTable, false)).to.throw('Missing consequence for rule');
    expect(() => engine.evaluate(rules, context)).to.throw('Missing consequence for rule');
    expect(() => engine.evaluateAll(rules, context)).to.throw('Missing consequence for rule');
  });

  it('should fail on bad condition', () => {
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
    const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction>(functionsTable, ruleFunctionsTable);
    expect(() => engine.validate(rules, validationContext))
      .to.throw('Invalid expression - unknown context key userIds');
    expect(() => validateRules<number, Con, RuleFunction, ExpressionFunction>(rules, validationContext,
      functionsTable, ruleFunctionsTable))
      .to.throw('Invalid expression - unknown context key userIds');
  });

  it('should fail on bad consequence ref', () => {
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
    const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction>(functionsTable, ruleFunctionsTable);
    expect(() => engine.validate(rules, validationContext))
      .to.throw('Invalid consequence ref - unknown context key userIdd');
    expect(() => validateRules<number, Con, RuleFunction, ExpressionFunction>(rules, validationContext,
      functionsTable, ruleFunctionsTable))
      .to.throw('Invalid consequence ref - unknown context key userIdd');
    expect(() => evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
      , ruleFunctionsTable, true)).to.throw('Invalid consequence ref - unknown context key userIdd');
    expect(() => evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
      , ruleFunctionsTable, false)).to.throw('Invalid consequence ref - unknown context key userIdd');
    expect(() => engine.evaluate(rules, context)).to.throw('Invalid consequence ref - unknown context key userIdd');
    expect(() => engine.evaluateAll(rules, context)).to.throw('Invalid consequence ref - unknown context key userIdd');
  });

  it('should evaluate and pass properly', () => {
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
    const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction>(functionsTable, ruleFunctionsTable);
    expect(engine.validate(rules, validationContext)).to.be.an('undefined');
    expect(validateRules<number, Con, RuleFunction, ExpressionFunction>(rules, validationContext,
      functionsTable, ruleFunctionsTable)).to.be.an('undefined');
    expect(evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
      , ruleFunctionsTable, true)).to.eql(undefined);
    expect(engine.evaluate(rules, context)).to.eql(undefined);
    expect(evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
      , ruleFunctionsTable, false)).to.eql(undefined);
    expect(engine.evaluateAll(rules, context)).to.eql(undefined);
  });

  it('should evaluate and fail properly on regular rule', () => {
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
    const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction>(functionsTable, ruleFunctionsTable);
    expect(engine.validate(rules, validationContext)).to.be.an('undefined');
    expect(validateRules<number, Con, RuleFunction, ExpressionFunction>(rules, validationContext,
      functionsTable, ruleFunctionsTable)).to.be.an('undefined');
    expect(evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
      , ruleFunctionsTable, true)).to.eql([{
      'custom': 578,
      'message': 'nested value 7 should not equal 7 days',
    }]);
    expect(evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
      , ruleFunctionsTable, false)).to.eql([{
      'custom': 578,
      'message': 'nested value 7 should not equal 7 days',
    }]);
    expect(engine.evaluate(rules, context)).to.eql({
      'custom': 578,
      'message': 'nested value 7 should not equal 7 days',
    });
    expect(engine.evaluateAll(rules, context)).to.eql([{
      'custom': 578,
      'message': 'nested value 7 should not equal 7 days',
    }]);
  });

  it('should evaluate and fail properly on function rule', () => {
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
    const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction>(functionsTable, ruleFunctionsTable);
    expect(engine.validate(rules, validationContext)).to.be.an('undefined');
    expect(validateRules<number, Con, RuleFunction, ExpressionFunction>(rules, validationContext,
      functionsTable, ruleFunctionsTable)).to.be.an('undefined');
    expect(evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
      , ruleFunctionsTable, true)).to.eql([{
      'custom': 543,
      'message': 'Username a is not allowed',
    }]);
    expect(evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
      , ruleFunctionsTable, false)).to.eql([{
      'custom': 543,
      'message': 'Username a is not allowed',
    }]);
    expect(engine.evaluate(rules, context)).to.eql({
      'custom': 543,
      'message': 'Username a is not allowed',
    });
    expect(engine.evaluateAll(rules, context)).to.eql([{
      'custom': 543,
      'message': 'Username a is not allowed',
    }]);
  });

  it('should evaluate and fail properly on regular rule with function', () => {
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
    const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction>(functionsTable, ruleFunctionsTable);
    expect(engine.validate(rules, validationContext)).to.be.an('undefined');
    expect(validateRules<number, Con, RuleFunction, ExpressionFunction>(rules, validationContext,
      functionsTable, ruleFunctionsTable)).to.be.an('undefined');
    expect(evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
      , ruleFunctionsTable, true)).to.eql([{
      'custom': 579,
      'message': 'user a should not equal a',
    }]);
    expect(evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
      , ruleFunctionsTable, false)).to.eql([{
      'custom': 579,
      'message': 'user a should not equal a',
    }]);
    expect(engine.evaluate(rules, context)).to.eql({
      'custom': 579,
      'message': 'user a should not equal a',
    });
    expect(engine.evaluateAll(rules, context)).to.eql([{
      'custom': 579,
      'message': 'user a should not equal a',
    }]);
  });

  it('should evaluate and fail properly on multiple rules', () => {
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
    const engine = new RulesEngine<number, Con, RuleFunction, ExpressionFunction>(functionsTable, ruleFunctionsTable);
    expect(engine.validate(rules, validationContext)).to.be.an('undefined');
    expect(validateRules<number, Con, RuleFunction, ExpressionFunction>(rules, validationContext,
      functionsTable, ruleFunctionsTable)).to.be.an('undefined');
    expect(evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
      , ruleFunctionsTable, true)).to.eql([{
      'custom': 579,
      'message': 'user should not equal a',
    }]);
    expect(evaluateRules<number, Con, RuleFunction, ExpressionFunction>(rules, context, functionsTable
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
    expect(engine.evaluate(rules, context)).to.eql({
      'custom': 579,
      'message': 'user should not equal a',
    });
    expect(engine.evaluateAll(rules, context)).to.eql([
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