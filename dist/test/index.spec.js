'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const __1 = require("../");
const functionsTable = {
    user: (user, context) => {
        return context.userId === user;
    },
};
describe('evaluator', () => {
    it('should evaluate short eq compare op to true', () => {
        chai_1.expect(__1.evaluate({ timesCounter: 5 }, {
            timesCounter: 5,
            userId: 'a',
        }, functionsTable)).to.eql(true);
    });
    it('should evaluate short eq compare op to false', () => {
        chai_1.expect(__1.evaluate({ timesCounter: 5 }, {
            timesCounter: 7,
            userId: 'a',
        }, functionsTable)).to.eql(false);
    });
    it('should evaluate eq compare op to true', () => {
        chai_1.expect(__1.evaluate({ timesCounter: { eq: 5 } }, {
            timesCounter: 5,
            userId: 'a',
        }, functionsTable)).to.eql(true);
    });
    it('should evaluate eq compare op to false', () => {
        chai_1.expect(__1.evaluate({ timesCounter: { eq: 5 } }, {
            timesCounter: 7,
            userId: 'a',
        }, functionsTable)).to.eql(false);
    });
    it('should evaluate neq compare op to true', () => {
        chai_1.expect(__1.evaluate({ timesCounter: { neq: 5 } }, {
            timesCounter: 8,
            userId: 'a',
        }, functionsTable)).to.eql(true);
    });
    it('should evaluate eq compare op to false', () => {
        chai_1.expect(__1.evaluate({ timesCounter: { neq: 5 } }, {
            timesCounter: 5,
            userId: 'a',
        }, functionsTable)).to.eql(false);
    });
    it('should evaluate gt compare op to true', () => {
        chai_1.expect(__1.evaluate({ timesCounter: { gt: 5 } }, {
            timesCounter: 8,
            userId: 'a',
        }, functionsTable)).to.eql(true);
    });
    it('should evaluate gt compare op to false', () => {
        chai_1.expect(__1.evaluate({ timesCounter: { gt: 5 } }, {
            timesCounter: 3,
            userId: 'a',
        }, functionsTable)).to.eql(false);
    });
    it('should evaluate gt compare op to false 2', () => {
        chai_1.expect(__1.evaluate({ timesCounter: { gt: 5 } }, {
            timesCounter: 5,
            userId: 'a',
        }, functionsTable)).to.eql(false);
    });
    it('should evaluate gte compare op to true', () => {
        chai_1.expect(__1.evaluate({ timesCounter: { gte: 5 } }, {
            timesCounter: 8,
            userId: 'a',
        }, functionsTable)).to.eql(true);
    });
    it('should evaluate gte compare op to true 2', () => {
        chai_1.expect(__1.evaluate({ timesCounter: { gte: 5 } }, {
            timesCounter: 5,
            userId: 'a',
        }, functionsTable)).to.eql(true);
    });
    it('should evaluate gte compare op to false', () => {
        chai_1.expect(__1.evaluate({ timesCounter: { gte: 5 } }, {
            timesCounter: 3,
            userId: 'a',
        }, functionsTable)).to.eql(false);
    });
    it('should evaluate lt compare op to true', () => {
        chai_1.expect(__1.evaluate({ timesCounter: { lt: 5 } }, {
            timesCounter: 3,
            userId: 'a',
        }, functionsTable)).to.eql(true);
    });
    it('should evaluate gt compare lt to false', () => {
        chai_1.expect(__1.evaluate({ timesCounter: { lt: 5 } }, {
            timesCounter: 8,
            userId: 'a',
        }, functionsTable)).to.eql(false);
    });
    it('should evaluate lt compare op to false 2', () => {
        chai_1.expect(__1.evaluate({ timesCounter: { lt: 5 } }, {
            timesCounter: 5,
            userId: 'a',
        }, functionsTable)).to.eql(false);
    });
    it('should evaluate lte compare op to true', () => {
        chai_1.expect(__1.evaluate({ timesCounter: { lte: 5 } }, {
            timesCounter: 3,
            userId: 'a',
        }, functionsTable)).to.eql(true);
    });
    it('should evaluate lte compare op to true 2', () => {
        chai_1.expect(__1.evaluate({ timesCounter: { lte: 5 } }, {
            timesCounter: 5,
            userId: 'a',
        }, functionsTable)).to.eql(true);
    });
    it('should evaluate lte compare op to false', () => {
        chai_1.expect(__1.evaluate({ timesCounter: { lte: 5 } }, {
            timesCounter: 8,
            userId: 'a',
        }, functionsTable)).to.eql(false);
    });
    it('should evaluate a single function', () => {
        chai_1.expect(__1.evaluate({ user: 'r@a.com' }, {
            userId: 'r@a.com',
            timesCounter: 8,
        }, functionsTable)).to.eql(true);
    });
    it('should evaluate a single not function to false', () => {
        chai_1.expect(__1.evaluate({ not: { user: 'r@a.com' } }, {
            userId: 'r@a.com',
            timesCounter: 8,
        }, functionsTable)).to.eql(false);
    });
    it('should evaluate a single not function to true', () => {
        chai_1.expect(__1.evaluate({ not: { user: 'a@a.com' } }, {
            userId: 'r@a.com',
            timesCounter: 8,
        }, functionsTable)).to.eql(true);
    });
    it('should evaluate a single and function to true', () => {
        chai_1.expect(__1.evaluate({ and: [{ user: 'r@a.com' }] }, {
            userId: 'r@a.com',
            timesCounter: 8,
        }, functionsTable)).to.eql(true);
    });
    it('should evaluate a single or function to true', () => {
        chai_1.expect(__1.evaluate({ or: [{ user: 'r@a.com' }] }, {
            userId: 'r@a.com',
            timesCounter: 8,
        }, functionsTable)).to.eql(true);
    });
    it('should evaluate a single and function to false', () => {
        chai_1.expect(__1.evaluate({ and: [{ user: 't@a.com' }] }, {
            userId: 'r@a.com',
            timesCounter: 8,
        }, functionsTable)).to.eql(false);
    });
    it('should evaluate a single or function to false', () => {
        chai_1.expect(__1.evaluate({ or: [{ user: 't@a.com' }] }, {
            userId: 'r@a.com',
            timesCounter: 8,
        }, functionsTable)).to.eql(false);
    });
    it('should fail on empty or op', () => {
        chai_1.expect(() => {
            __1.evaluate({ or: [] }, { userId: 'r@a.com', timesCounter: 8 }, functionsTable);
        }).to.throw('Invalid expression - or operator must have at least one expression');
    });
    it('should fail on empty and op', () => {
        chai_1.expect(() => {
            __1.evaluate({ and: [] }, { userId: 'r@a.com', timesCounter: 8 }, functionsTable);
        }).to.throw('Invalid expression - and operator must have at least one expression');
    });
    it('should fail on non existing function', () => {
        chai_1.expect(() => {
            // @ts-ignore
            __1.evaluate({ and: [{ dummy: 1 }] }, { userId: 'r@a.com', timesCounter: 8 }, functionsTable);
        }).to.throw('Invalid expression - unknown function dummy');
    });
    it('should fail on non existing function 2', () => {
        chai_1.expect(() => {
            // @ts-ignore
            __1.evaluate({ dummy: 1 }, { userId: 'r@a.com', timesCounter: 8 }, functionsTable);
        }).to.throw('Invalid expression - unknown function dummy');
    });
    it('should fail on non existing op', () => {
        chai_1.expect(() => {
            // @ts-ignore
            __1.evaluate({ userId: { bk: 1 } }, { userId: 'r@a.com', timesCounter: 8 }, functionsTable);
        }).to.throw('Invalid expression - unknown op bk');
    });
    it('should fail too many keys to op', () => {
        chai_1.expect(() => {
            // @ts-ignore
            __1.evaluate({ userId: { eq: 1, nq: 2 } }, {
                userId: 'r@a.com',
                timesCounter: 8,
            }, functionsTable);
        }).to.throw('Invalid expression - too may keys');
    });
    it('should fail too many keys', () => {
        chai_1.expect(() => {
            // @ts-ignore
            __1.evaluate({ dummy: 1, user: 'a' }, { userId: 'r@a.com', timesCounter: 8 }, functionsTable);
        }).to.throw('Invalid expression - too may keys');
    });
    it('should fail too many keys 2', () => {
        chai_1.expect(() => {
            // @ts-ignore
            __1.evaluate({ or: [{ dummy: 1, user: 'a' }] }, {
                userId: 'r@a.com',
                timesCounter: 8,
            }, functionsTable);
        }).to.throw('Invalid expression - too may keys');
    });
});
//# sourceMappingURL=index.spec.js.map