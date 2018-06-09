'use strict';

import { expect } from 'chai';
import { evaluate } from '../dist/index';

describe('evaluator', function() {

    const functionsTable = {
        user: (user: string, context: {userId: string}): boolean => {
            return context.userId === user;
        }
    };

    it('should evaluate short eq compare op to true', function() {
        expect(evaluate({ timesCounter: 5 }, { timesCounter: 5 }, functionsTable)).to.eql(true);
    });

    it('should evaluate short eq compare op to false', function() {
        expect(evaluate({ timesCounter: 5 }, { timesCounter: 7 }, functionsTable)).to.eql(false);
    });

    it('should evaluate eq compare op to true', function() {
        expect(evaluate({ timesCounter: {eq: 5} }, { timesCounter: 5 }, functionsTable)).to.eql(true);
    });

    it('should evaluate eq compare op to false', function() {
        expect(evaluate({ timesCounter: {eq: 5} }, { timesCounter: 7 }, functionsTable)).to.eql(false);
    });

    it('should evaluate neq compare op to true', function() {
        expect(evaluate({ timesCounter: {neq: 5} }, { timesCounter: 8 }, functionsTable)).to.eql(true);
    });

    it('should evaluate eq compare op to false', function() {
        expect(evaluate({ timesCounter: {neq: 5} }, { timesCounter: 5 }, functionsTable)).to.eql(false);
    });

    it('should evaluate gt compare op to true', function() {
        expect(evaluate({ timesCounter: {gt: 5} }, { timesCounter: 8 }, functionsTable)).to.eql(true);
    });

    it('should evaluate gt compare op to false', function() {
        expect(evaluate({ timesCounter: {gt: 5} }, { timesCounter: 3 }, functionsTable)).to.eql(false);
    });

    it('should evaluate gt compare op to false 2', function() {
        expect(evaluate({ timesCounter: {gt: 5} }, { timesCounter: 5 }, functionsTable)).to.eql(false);
    });

    it('should evaluate gte compare op to true', function() {
        expect(evaluate({ timesCounter: {gte: 5} }, { timesCounter: 8 }, functionsTable)).to.eql(true);
    });

    it('should evaluate gte compare op to true 2', function() {
        expect(evaluate({ timesCounter: {gte: 5} }, { timesCounter: 5 }, functionsTable)).to.eql(true);
    });

    it('should evaluate gte compare op to false', function() {
        expect(evaluate({ timesCounter: {gte: 5} }, { timesCounter: 3 }, functionsTable)).to.eql(false);
    });

    it('should evaluate lt compare op to true', function() {
        expect(evaluate({ timesCounter: {lt: 5} }, { timesCounter: 3 }, functionsTable)).to.eql(true);
    });

    it('should evaluate gt compare lt to false', function() {
        expect(evaluate({ timesCounter: {lt: 5} }, { timesCounter: 8 }, functionsTable)).to.eql(false);
    });

    it('should evaluate lt compare op to false 2', function() {
        expect(evaluate({ timesCounter: {lt: 5} }, { timesCounter: 5 }, functionsTable)).to.eql(false);
    });

    it('should evaluate lte compare op to true', function() {
        expect(evaluate({ timesCounter: {lte: 5} }, { timesCounter: 3 }, functionsTable)).to.eql(true);
    });

    it('should evaluate lte compare op to true 2', function() {
        expect(evaluate({ timesCounter: {lte: 5} }, { timesCounter: 5 }, functionsTable)).to.eql(true);
    });

    it('should evaluate lte compare op to false', function() {
        expect(evaluate({ timesCounter: {lte: 5} }, { timesCounter: 8 }, functionsTable)).to.eql(false);
    });

    it('should evaluate a single function', function() {
        expect(evaluate({ user: 'r@a.com' }, { userId: 'r@a.com' }, functionsTable)).to.eql(true);
    });

    it('should evaluate a single not function to false', function() {
        expect(evaluate({ not: { user: 'r@a.com' } }, { userId: 'r@a.com' }, functionsTable)).to.eql(false);
    });

    it('should evaluate a single not function to true', function() {
        expect(evaluate({ not: { user: 'a@a.com' } }, { userId: 'r@a.com' }, functionsTable)).to.eql(true);
    });

    it('should evaluate a single and function to true', function() {
        expect(evaluate({ and: [{ user: 'r@a.com' }] }, { userId: 'r@a.com' }, functionsTable)).to.eql(true);
    });

    it('should evaluate a single or function to true', function() {
        expect(evaluate({ or: [{ user: 'r@a.com' }] }, { userId: 'r@a.com' }, functionsTable)).to.eql(true);
    });

    it('should evaluate a single and function to false', function() {
        expect(evaluate({ and: [{ user: 't@a.com' }] }, { userId: 'r@a.com' }, functionsTable)).to.eql(false);
    });

    it('should evaluate a single or function to false', function() {
        expect(evaluate({ or: [{ user: 't@a.com' }] }, { userId: 'r@a.com' }, functionsTable)).to.eql(false);
    });

    it('should fail on empty or op', function() {
        expect(function() {
            evaluate({ or: [] }, { userId: 'r@a.com' }, functionsTable);
        }).to.throw('Invalid expression - or operator must have at least one expression');
    });

    it('should fail on empty and op', function() {
        expect(function() {
            evaluate({ and: [] }, { userId: 'r@a.com' }, functionsTable);
        }).to.throw('Invalid expression - and operator must have at least one expression');
    });

    it('should fail on non existing function', function() {
        expect(function() {
            evaluate({ and: [{ dummy: 1 }] }, { userId: 'r@a.com' }, functionsTable);
        }).to.throw('Invalid expression - unknown function dummy');
    });

    it('should fail on non existing function 2', function() {
        expect(function() {
            evaluate({ dummy: 1 }, { userId: 'r@a.com' }, functionsTable);
        }).to.throw('Invalid expression - unknown function dummy');
    });

    it('should fail on non existing op', function() {
        expect(function() {
            evaluate({ userId: {bk : 1} }, { userId: 'r@a.com' }, functionsTable);
        }).to.throw('Invalid expression - unknown op bk');
    });

    it('should fail too many keys to op', function() {
        expect(function() {
            evaluate({ userId: {eq : 1, nq: 2} }, { userId: 'r@a.com' }, functionsTable);
        }).to.throw('Invalid expression - too may keys');
    });

    it('should fail too many keys', function() {
        expect(function() {
            evaluate({ dummy: 1, user: 'a' }, { userId: 'r@a.com' }, functionsTable);
        }).to.throw('Invalid expression - too may keys');
    });

    it('should fail too many keys 2', function() {
        expect(function() {
            evaluate({ or: [{ dummy: 1, user: 'a' }] }, { userId: 'r@a.com' }, functionsTable);
        }).to.throw('Invalid expression - too may keys');
    });
});
