'use strict';

import { expect } from 'chai';
import { evaluate } from '../dist/index';

describe('evaluator', function() {

    const functionsTable = {
        user: (user: string, context: {userId: string}): boolean => {
            return context.userId === user;
        }
    };

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
