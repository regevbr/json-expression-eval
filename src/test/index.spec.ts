'use strict';

import {expect} from 'chai';
import {evaluate} from '../';

const functionsTable = {
    user: (user: string, context: { userId: string }): boolean => {
        return context.userId === user;
    },
};

describe('evaluator', () => {

    it('should evaluate short eq compare op to true', () => {
        expect(evaluate({timesCounter: 5}, {
            timesCounter: 5,
            userId: 'a',
        }, functionsTable)).to.eql(true);
    });

    it('should evaluate short eq compare op to false', () => {
        expect(evaluate({timesCounter: 5}, {
            timesCounter: 7,
            userId: 'a',
        }, functionsTable)).to.eql(false);
    });

    it('should evaluate eq compare op to true', () => {
        expect(evaluate({timesCounter: {eq: 5}}, {
            timesCounter: 5,
            userId: 'a',
        }, functionsTable)).to.eql(true);
    });

    it('should evaluate eq compare op to false', () => {
        expect(evaluate({timesCounter: {eq: 5}}, {
            timesCounter: 7,
            userId: 'a',
        }, functionsTable)).to.eql(false);
    });

    it('should evaluate neq compare op to true', () => {
        expect(evaluate({timesCounter: {neq: 5}}, {
            timesCounter: 8,
            userId: 'a',
        }, functionsTable)).to.eql(true);
    });

    it('should evaluate eq compare op to false', () => {
        expect(evaluate({timesCounter: {neq: 5}}, {
            timesCounter: 5,
            userId: 'a',
        }, functionsTable)).to.eql(false);
    });

    it('should evaluate gt compare op to true', () => {
        expect(evaluate({timesCounter: {gt: 5}}, {
            timesCounter: 8,
            userId: 'a',
        }, functionsTable)).to.eql(true);
    });

    it('should evaluate gt compare op to false', () => {
        expect(evaluate({timesCounter: {gt: 5}}, {
            timesCounter: 3,
            userId: 'a',
        }, functionsTable)).to.eql(false);
    });

    it('should evaluate gt compare op to false 2', () => {
        expect(evaluate({timesCounter: {gt: 5}}, {
            timesCounter: 5,
            userId: 'a',
        }, functionsTable)).to.eql(false);
    });

    it('should evaluate gte compare op to true', () => {
        expect(evaluate({timesCounter: {gte: 5}}, {
            timesCounter: 8,
            userId: 'a',
        }, functionsTable)).to.eql(true);
    });

    it('should evaluate gte compare op to true 2', () => {
        expect(evaluate({timesCounter: {gte: 5}}, {
            timesCounter: 5,
            userId: 'a',
        }, functionsTable)).to.eql(true);
    });

    it('should evaluate gte compare op to false', () => {
        expect(evaluate({timesCounter: {gte: 5}}, {
            timesCounter: 3,
            userId: 'a',
        }, functionsTable)).to.eql(false);
    });

    it('should evaluate lt compare op to true', () => {
        expect(evaluate({timesCounter: {lt: 5}}, {
            timesCounter: 3,
            userId: 'a',
        }, functionsTable)).to.eql(true);
    });

    it('should evaluate gt compare lt to false', () => {
        expect(evaluate({timesCounter: {lt: 5}}, {
            timesCounter: 8,
            userId: 'a',
        }, functionsTable)).to.eql(false);
    });

    it('should evaluate lt compare op to false 2', () => {
        expect(evaluate({timesCounter: {lt: 5}}, {
            timesCounter: 5,
            userId: 'a',
        }, functionsTable)).to.eql(false);
    });

    it('should evaluate lte compare op to true', () => {
        expect(evaluate({timesCounter: {lte: 5}}, {
            timesCounter: 3,
            userId: 'a',
        }, functionsTable)).to.eql(true);
    });

    it('should evaluate lte compare op to true 2', () => {
        expect(evaluate({timesCounter: {lte: 5}}, {
            timesCounter: 5,
            userId: 'a',
        }, functionsTable)).to.eql(true);
    });

    it('should evaluate lte compare op to false', () => {
        expect(evaluate({timesCounter: {lte: 5}}, {
            timesCounter: 8,
            userId: 'a',
        }, functionsTable)).to.eql(false);
    });

    it('should evaluate a single function', () => {
        expect(evaluate({user: 'r@a.com'}, {
            userId: 'r@a.com',
            timesCounter: 8,
        }, functionsTable)).to.eql(true);
    });

    it('should evaluate a single not function to false', () => {
        expect(evaluate({not: {user: 'r@a.com'}}, {
            userId: 'r@a.com',
            timesCounter: 8,
        }, functionsTable)).to.eql(false);
    });

    it('should evaluate a single not function to true', () => {
        expect(evaluate({not: {user: 'a@a.com'}}, {
            userId: 'r@a.com',
            timesCounter: 8,
        }, functionsTable)).to.eql(true);
    });

    it('should evaluate a single and function to true', () => {
        expect(evaluate({and: [{user: 'r@a.com'}]}, {
            userId: 'r@a.com',
            timesCounter: 8,
        }, functionsTable)).to.eql(true);
    });

    it('should evaluate a single or function to true', () => {
        expect(evaluate({or: [{user: 'r@a.com'}]}, {
            userId: 'r@a.com',
            timesCounter: 8,
        }, functionsTable)).to.eql(true);
    });

    it('should evaluate a single and function to false', () => {
        expect(evaluate({and: [{user: 't@a.com'}]}, {
            userId: 'r@a.com',
            timesCounter: 8,
        }, functionsTable)).to.eql(false);
    });

    it('should evaluate a single or function to false', () => {
        expect(evaluate({or: [{user: 't@a.com'}]}, {
            userId: 'r@a.com',
            timesCounter: 8,
        }, functionsTable)).to.eql(false);
    });

    it('should fail on empty or op', () => {
        expect(() => {
            evaluate({or: []}, {userId: 'r@a.com', timesCounter: 8}, functionsTable);
        }).to.throw('Invalid expression - or operator must have at least one expression');
    });

    it('should fail on empty and op', () => {
        expect(() => {
            evaluate({and: []}, {userId: 'r@a.com', timesCounter: 8}, functionsTable);
        }).to.throw('Invalid expression - and operator must have at least one expression');
    });

    it('should fail on non existing function', () => {
        expect(() => {
            // @ts-ignore
            evaluate({and: [{dummy: 1}]}, {userId: 'r@a.com', timesCounter: 8}, functionsTable);
        }).to.throw('Invalid expression - unknown function dummy');
    });

    it('should fail on non existing function 2', () => {
        expect(() => {
            // @ts-ignore
            evaluate({dummy: 1}, {userId: 'r@a.com', timesCounter: 8}, functionsTable);
        }).to.throw('Invalid expression - unknown function dummy');
    });

    it('should fail on non existing op', () => {
        expect(() => {
            // @ts-ignore
            evaluate({userId: {bk: 1}}, {userId: 'r@a.com', timesCounter: 8}, functionsTable);
        }).to.throw('Invalid expression - unknown op bk');
    });

    it('should fail too many keys to op', () => {
        expect(() => {
            // @ts-ignore
            evaluate({userId: {eq: 1, nq: 2}}, {
                userId: 'r@a.com',
                timesCounter: 8,
            }, functionsTable);
        }).to.throw('Invalid expression - too may keys');
    });

    it('should fail too many keys', () => {
        expect(() => {
            // @ts-ignore
            evaluate({dummy: 1, user: 'a'}, {userId: 'r@a.com', timesCounter: 8}, functionsTable);
        }).to.throw('Invalid expression - too may keys');
    });

    it('should fail too many keys 2', () => {
        expect(() => {
            // @ts-ignore
            evaluate({or: [{dummy: 1, user: 'a'}]}, {
                userId: 'r@a.com',
                timesCounter: 8,
            }, functionsTable);
        }).to.throw('Invalid expression - too may keys');
    });
});
