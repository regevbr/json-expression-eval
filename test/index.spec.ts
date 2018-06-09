'use strict';

import {expect} from 'chai';
import {evaluate} from '../dist';

interface Context {
    userId: string;
    timesCounter: number;
}

describe('evaluator', function () {

    const functionsTable = {
        user: (user: string, context: { userId: string }): boolean => {
            return context.userId === user;
        }
    };

    it('should evaluate short eq compare op to true', function () {
        expect(evaluate<Context>({timesCounter: 5}, {timesCounter: 5, userId: 'a'}, functionsTable)).to.eql(true);
    });

    it('should evaluate short eq compare op to false', function () {
        expect(evaluate<Context>({timesCounter: 5}, {timesCounter: 7, userId: 'a'}, functionsTable)).to.eql(false);
    });

    it('should evaluate eq compare op to true', function () {
        expect(evaluate<Context>({timesCounter: {eq: 5}}, {timesCounter: 5, userId: 'a'}, functionsTable)).to.eql(true);
    });

    it('should evaluate eq compare op to false', function () {
        expect(evaluate<Context>({timesCounter: {eq: 5}}, {
            timesCounter: 7,
            userId: 'a'
        }, functionsTable)).to.eql(false);
    });

    it('should evaluate neq compare op to true', function () {
        expect(evaluate<Context>({timesCounter: {neq: 5}}, {
            timesCounter: 8,
            userId: 'a'
        }, functionsTable)).to.eql(true);
    });

    it('should evaluate eq compare op to false', function () {
        expect(evaluate<Context>({timesCounter: {neq: 5}}, {
            timesCounter: 5,
            userId: 'a'
        }, functionsTable)).to.eql(false);
    });

    it('should evaluate gt compare op to true', function () {
        expect(evaluate<Context>({timesCounter: {gt: 5}}, {timesCounter: 8, userId: 'a'}, functionsTable)).to.eql(true);
    });

    it('should evaluate gt compare op to false', function () {
        expect(evaluate<Context>({timesCounter: {gt: 5}}, {
            timesCounter: 3,
            userId: 'a'
        }, functionsTable)).to.eql(false);
    });

    it('should evaluate gt compare op to false 2', function () {
        expect(evaluate<Context>({timesCounter: {gt: 5}}, {
            timesCounter: 5,
            userId: 'a'
        }, functionsTable)).to.eql(false);
    });

    it('should evaluate gte compare op to true', function () {
        expect(evaluate<Context>({timesCounter: {gte: 5}}, {
            timesCounter: 8,
            userId: 'a'
        }, functionsTable)).to.eql(true);
    });

    it('should evaluate gte compare op to true 2', function () {
        expect(evaluate<Context>({timesCounter: {gte: 5}}, {
            timesCounter: 5,
            userId: 'a'
        }, functionsTable)).to.eql(true);
    });

    it('should evaluate gte compare op to false', function () {
        expect(evaluate<Context>({timesCounter: {gte: 5}}, {
            timesCounter: 3,
            userId: 'a'
        }, functionsTable)).to.eql(false);
    });

    it('should evaluate lt compare op to true', function () {
        expect(evaluate<Context>({timesCounter: {lt: 5}}, {timesCounter: 3, userId: 'a'}, functionsTable)).to.eql(true);
    });

    it('should evaluate gt compare lt to false', function () {
        expect(evaluate<Context>({timesCounter: {lt: 5}}, {
            timesCounter: 8,
            userId: 'a'
        }, functionsTable)).to.eql(false);
    });

    it('should evaluate lt compare op to false 2', function () {
        expect(evaluate<Context>({timesCounter: {lt: 5}}, {
            timesCounter: 5,
            userId: 'a'
        }, functionsTable)).to.eql(false);
    });

    it('should evaluate lte compare op to true', function () {
        expect(evaluate<Context>({timesCounter: {lte: 5}}, {
            timesCounter: 3,
            userId: 'a'
        }, functionsTable)).to.eql(true);
    });

    it('should evaluate lte compare op to true 2', function () {
        expect(evaluate<Context>({timesCounter: {lte: 5}}, {
            timesCounter: 5,
            userId: 'a'
        }, functionsTable)).to.eql(true);
    });

    it('should evaluate lte compare op to false', function () {
        expect(evaluate<Context>({timesCounter: {lte: 5}}, {
            timesCounter: 8,
            userId: 'a'
        }, functionsTable)).to.eql(false);
    });

    it('should evaluate a single function', function () {
        expect(evaluate<Context>({user: 'r@a.com'}, {userId: 'r@a.com', timesCounter: 8}, functionsTable)).to.eql(true);
    });

    it('should evaluate a single not function to false', function () {
        expect(evaluate<Context>({not: {user: 'r@a.com'}}, {
            userId: 'r@a.com',
            timesCounter: 8
        }, functionsTable)).to.eql(false);
    });

    it('should evaluate a single not function to true', function () {
        expect(evaluate<Context>({not: {user: 'a@a.com'}}, {
            userId: 'r@a.com',
            timesCounter: 8
        }, functionsTable)).to.eql(true);
    });

    it('should evaluate a single and function to true', function () {
        expect(evaluate<Context>({and: [{user: 'r@a.com'}]}, {
            userId: 'r@a.com',
            timesCounter: 8
        }, functionsTable)).to.eql(true);
    });

    it('should evaluate a single or function to true', function () {
        expect(evaluate<Context>({or: [{user: 'r@a.com'}]}, {
            userId: 'r@a.com',
            timesCounter: 8
        }, functionsTable)).to.eql(true);
    });

    it('should evaluate a single and function to false', function () {
        expect(evaluate<Context>({and: [{user: 't@a.com'}]}, {
            userId: 'r@a.com',
            timesCounter: 8
        }, functionsTable)).to.eql(false);
    });

    it('should evaluate a single or function to false', function () {
        expect(evaluate<Context>({or: [{user: 't@a.com'}]}, {
            userId: 'r@a.com',
            timesCounter: 8
        }, functionsTable)).to.eql(false);
    });

    it('should fail on empty or op', function () {
        expect(function () {
            evaluate<Context>({or: []}, {userId: 'r@a.com', timesCounter: 8}, functionsTable);
        }).to.throw('Invalid expression - or operator must have at least one expression');
    });

    it('should fail on empty and op', function () {
        expect(function () {
            evaluate<Context>({and: []}, {userId: 'r@a.com', timesCounter: 8}, functionsTable);
        }).to.throw('Invalid expression - and operator must have at least one expression');
    });

    it('should fail on non existing function', function () {
        expect(function () {
            evaluate<Context>({and: [{dummy: 1}]}, {userId: 'r@a.com', timesCounter: 8}, functionsTable);
        }).to.throw('Invalid expression - unknown function dummy');
    });

    it('should fail on non existing function 2', function () {
        expect(function () {
            evaluate<Context>({dummy: 1}, {userId: 'r@a.com', timesCounter: 8}, functionsTable);
        }).to.throw('Invalid expression - unknown function dummy');
    });

    it('should fail on non existing op', function () {
        expect(function () {
            evaluate<Context>({userId: {bk: 1}}, {userId: 'r@a.com', timesCounter: 8}, functionsTable);
        }).to.throw('Invalid expression - unknown op bk');
    });

    it('should fail too many keys to op', function () {
        expect(function () {
            evaluate<Context>({userId: {eq: 1, nq: 2}}, {userId: 'r@a.com', timesCounter: 8}, functionsTable);
        }).to.throw('Invalid expression - too may keys');
    });

    it('should fail too many keys', function () {
        expect(function () {
            evaluate<Context>({dummy: 1, user: 'a'}, {userId: 'r@a.com', timesCounter: 8}, functionsTable);
        }).to.throw('Invalid expression - too may keys');
    });

    it('should fail too many keys 2', function () {
        expect(function () {
            evaluate<Context>({or: [{dummy: 1, user: 'a'}]}, {userId: 'r@a.com', timesCounter: 8}, functionsTable);
        }).to.throw('Invalid expression - too may keys');
    });
});
