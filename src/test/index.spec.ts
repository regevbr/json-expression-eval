'use strict';

import {expect} from 'chai';
import {evaluate, ExpressionEval, validate} from '../';

const functionsTable = {
    user: (user: string, context: { userId: string }): boolean => {
        return context.userId === user;
    },
};
type ExpressionFunction = typeof functionsTable;

describe('evaluator', () => {

    it('should evaluate short eq compare op true to on nested properties', () => {
        const expression = {
            'nested.value': 7,
        };
        const context = {
            timesCounter: 5,
            userId: 'a',
            nested: {
                value2: 9,
                value: 7,
            },
        };
        const exp = new ExpressionEval<typeof context, ExpressionFunction>(expression, functionsTable);
        expect(exp.validate(context)).to.be.an('undefined');
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(true);
        expect(exp.evaluate(context)).to.eql(true);
    });

    it('should evaluate short eq compare op true to on deeply nested properties', () => {
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
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(true);
    });

    it('should evaluate short eq compare op to true', () => {
        const expression = {
            timesCounter: 5,
        };
        const context = {
            timesCounter: 5,
            userId: 'a',
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(true);
    });

    it('should evaluate short eq compare op to false', () => {
        const expression = {
            timesCounter: 5,
        };
        const context = {
            timesCounter: 7,
            userId: 'a',
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(false);
    });

    it('should evaluate eq compare op to true', () => {
        const expression = {
            timesCounter: {eq: 5},
        };
        const context = {
            timesCounter: 5,
            userId: 'a',
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(true);
    });

    it('should evaluate eq compare op to true on nested properties', () => {
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
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(true);
    });

    it('should evaluate eq compare op true to on deeply nested properties', () => {
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
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(true);
    });

    it('should evaluate eq compare op to false', () => {
        const expression = {
            timesCounter: {eq: 5},
        };
        const context = {
            timesCounter: 7,
            userId: 'a',
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(false);
    });

    it('should evaluate neq compare op to true', () => {
        const expression = {
            timesCounter: {neq: 5},
        };
        const context = {
            timesCounter: 8,
            userId: 'a',
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(true);
    });

    it('should evaluate eq compare op to false', () => {
        const expression = {
            timesCounter: {neq: 5},
        };
        const context = {
            timesCounter: 5,
            userId: 'a',
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(false);
    });

    it('should evaluate gt compare op to true', () => {
        const expression = {
            timesCounter: {gt: 5},
        };
        const context = {
            timesCounter: 8,
            userId: 'a',
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(true);
    });

    it('should evaluate gt compare op to false', () => {
        const expression = {
            timesCounter: {gt: 5},
        };
        const context = {
            timesCounter: 3,
            userId: 'a',
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(false);
    });

    it('should evaluate gt compare op to false 2', () => {
        const expression = {
            timesCounter: {gt: 5},
        };
        const context = {
            timesCounter: 5,
            userId: 'a',
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(false);
    });

    it('should evaluate gte compare op to true', () => {
        const expression = {
            timesCounter: {gte: 5},
        };
        const context = {
            timesCounter: 8,
            userId: 'a',
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(true);
    });

    it('should evaluate gte compare op to true 2', () => {
        const expression = {
            timesCounter: {gte: 5},
        };
        const context = {
            timesCounter: 5,
            userId: 'a',
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(true);
    });

    it('should evaluate gte compare op to false', () => {
        const expression = {
            timesCounter: {gte: 5},
        };
        const context = {
            timesCounter: 3,
            userId: 'a',
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(false);
    });

    it('should evaluate lt compare op to true', () => {
        const expression = {
            timesCounter: {lt: 5},
        };
        const context = {
            timesCounter: 3,
            userId: 'a',
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(true);
    });

    it('should evaluate gt compare lt to false', () => {
        const expression = {
            timesCounter: {lt: 5},
        };
        const context = {
            timesCounter: 8,
            userId: 'a',
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(false);
    });

    it('should evaluate lt compare op to false 2', () => {
        const expression = {
            timesCounter: {lt: 5},
        };
        const context = {
            timesCounter: 5,
            userId: 'a',
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(false);
    });

    it('should evaluate lte compare op to true', () => {
        const expression = {
            timesCounter: {lte: 5},
        };
        const context = {
            timesCounter: 3,
            userId: 'a',
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(true);
    });

    it('should evaluate lte compare op to true 2', () => {
        const expression = {
            timesCounter: {lte: 5},
        };
        const context = {
            timesCounter: 5,
            userId: 'a',
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(true);
    });

    it('should evaluate lte compare op to false', () => {
        const expression = {
            timesCounter: {lte: 5},
        };
        const context = {
            timesCounter: 8,
            userId: 'a',
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(false);
    });

    it('should evaluate a single function', () => {
        const expression = {user: 'r@a.com'};
        const context = {
            userId: 'r@a.com',
            timesCounter: 8,
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(true);
    });

    it('should evaluate a single not function to false', () => {
        const expression = {not: {user: 'r@a.com'}};
        const context = {
            userId: 'r@a.com',
            timesCounter: 8,
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(false);
    });

    it('should evaluate a single not function to true', () => {
        const expression = {not: {user: 'a@a.com'}};
        const context = {
            userId: 'r@a.com',
            timesCounter: 8,
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(true);
    });

    it('should evaluate a single and function to true', () => {
        const expression = {and: [{user: 'r@a.com'}]};
        const context = {
            userId: 'r@a.com',
            timesCounter: 8,
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(true);
    });

    it('should evaluate a single or function to true', () => {
        const expression = {or: [{user: 'r@a.com'}]};
        const context = {
            userId: 'r@a.com',
            timesCounter: 8,
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(true);
    });

    it('should evaluate a single and function to false', () => {
        const expression = {and: [{user: 't@a.com'}]};
        const context = {
            userId: 'r@a.com',
            timesCounter: 8,
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(false);
    });

    it('should evaluate a single or function to false', () => {
        const expression = {or: [{user: 't@a.com'}]};
        const context = {
            userId: 'r@a.com',
            timesCounter: 8,
        };
        expect(validate(expression, context, functionsTable)).to.be.an('undefined');
        expect(evaluate(expression, context, functionsTable)).to.eql(false);
    });

    it('should fail on empty or op', () => {
        const expression = {or: []};
        const context = {userId: 'r@a.com', timesCounter: 8};
        expect(() => validate(expression, context, functionsTable))
            .to.throw('Invalid expression - or operator must have at least one expression');
        expect(() => evaluate(expression, context, functionsTable))
            .to.throw('Invalid expression - or operator must have at least one expression');
    });

    it('should fail on empty and op', () => {
        const expression = {and: []};
        const context = {userId: 'r@a.com', timesCounter: 8};
        expect(() => validate(expression, context, functionsTable))
            .to.throw('Invalid expression - and operator must have at least one expression');
        expect(() => evaluate(expression, context, functionsTable))
            .to.throw('Invalid expression - and operator must have at least one expression');
    });

    it('should fail on non existing function', () => {
        const expression: any = {and: [{dummy: 1}]};
        const context = {userId: 'r@a.com', timesCounter: 8};
        expect(() => validate(expression, context, functionsTable))
            .to.throw('Invalid expression - unknown function dummy');
        expect(() => evaluate(expression, context, functionsTable))
            .to.throw('Invalid expression - unknown function dummy');
    });

    it('should fail on non existing function 2', () => {
        const expression: any = {dummy: 1};
        const context = {userId: 'r@a.com', timesCounter: 8};
        expect(() => validate(expression, context, functionsTable))
            .to.throw('Invalid expression - unknown function dummy');
        expect(() => evaluate(expression, context, functionsTable))
            .to.throw('Invalid expression - unknown function dummy');
    });

    it('should fail on non existing op', () => {
        const expression: any = {userId: {bk: 1}};
        const context = {userId: 'r@a.com', timesCounter: 8};
        expect(() => validate(expression, context, functionsTable))
            .to.throw('Invalid expression - unknown op bk');
        expect(() => evaluate(expression, context, functionsTable))
            .to.throw('Invalid expression - unknown op bk');
    });

    it('should fail too many keys to op', () => {
        const expression: any = {userId: {eq: 1, nq: 2}};
        const context = {userId: 'r@a.com', timesCounter: 8};
        expect(() => validate(expression, context, functionsTable))
            .to.throw('Invalid expression - too may keys');
        expect(() => evaluate(expression, context, functionsTable))
            .to.throw('Invalid expression - too may keys');
    });

    it('should fail too many keys', () => {
        const expression: any = {timesCounter: 1, userId: 'a'};
        const context = {userId: 'r@a.com', timesCounter: 8};
        expect(() => validate(expression, context, functionsTable))
            .to.throw('Invalid expression - too may keys');
        expect(() => evaluate(expression, context, functionsTable))
            .to.throw('Invalid expression - too may keys');
    });

    it('should fail too many keys 2', () => {
        const expression: any = {or: [{userId: 1, timesCounter: 'a'}]};
        const context = {userId: 'r@a.com', timesCounter: 8};
        expect(() => validate(expression, context, functionsTable))
            .to.throw('Invalid expression - too may keys');
        expect(() => evaluate(expression, context, functionsTable))
            .to.throw('Invalid expression - too may keys');
    });

    describe('short circuit', () => {
        it('or is short circuiting', () => {
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
            validate(expression, context, fnTable);
            expect(fnCounter).to.eql(0);
            evaluate(expression, context, fnTable);
            expect(fnCounter).to.eql(3);
        });

        it('and is short circuiting', () => {
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
            validate(expression, context, fnTable);
            expect(fnCounter).to.eql(0);
            evaluate(expression, context, fnTable);
            expect(fnCounter).to.eql(3);
        });
    });

});
