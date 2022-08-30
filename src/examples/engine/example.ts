import {ExpressionContext, engine, MyRule} from './lib/engine';
import moment = require('moment');

const context: ExpressionContext = {
  userId: 'a@b.com',
  date: moment(),
  times: 3,
  nested: {
    value: 5,
    nested2: {
      value: 7,
    },
  },
};

const run = async (_rules: MyRule[], _context: ExpressionContext) => {
  const result = await engine.evaluateAll(_rules, _context);
  console.log(`Evaluating rules ${JSON.stringify(_rules)} using context ${JSON.stringify(_context)}`);
  console.log(`Result: ${JSON.stringify(result)}\n\n`);
};

let rules: MyRule[] = [
  {
    condition: {
      user: 'a@b.com',
    },
    consequence: {
      message: ['user', {
        ref: 'userId',
      }, 'should not equal a@b.com'],
      custom: 579,
    },
  },
];

run(rules, context);

rules = [
  {
    userRule: 'a@b.com',
  },
];

run(rules, context);

rules = [
  {
    condition: {
      and: [
        {user: 'a@b.com'},
        {maxCount: 5},
        {times: {eq:{ref:'nested.value'}}},
        {times: {lte:{op:'+', lhs: {ref:'nested.value'}, rhs: 1}}},
      ],
    },
    consequence: {
      message: [
        'user', {
          ref: 'userId',
        },
        'should not equal a@b.com',
        'while times',
        {
          ref: 'times',
        },
        'is less than 5',
      ],
      custom: 579,
    },
  },
];

run(rules, context);

rules = [
  {
    condition: {
      and: [
        {user: 'a@b.com'},
        {maxCount: 1},
      ],
    },
    consequence: {
      message: [
        'user', {
          ref: 'userId',
        },
        'should not equal a@b.com',
        'while times',
        {
          ref: 'times',
        },
        'is less than 1',
      ],
      custom: 579,
    },
  },
];

run(rules, context);

rules = [
  {
    condition: {
      and: [
        {not: {user: 'a@b.com'}},
        {maxCount: 1},
      ],
    },
    consequence: {
      message: [
        'user', {
          ref: 'userId',
        },
        'should equal a@b.com',
        'while times',
        {
          ref: 'times',
        },
        'is less than 1',
      ],
      custom: 579,
    },
  },
];

run(rules, context);

rules = [
  {
    userRule: 'a@b.com',
  },
  {
    condition: {
      times: 3,
    },
    consequence: {
      message: [
        'times', {
          ref: 'times',
        },
        'should not equal 3',
      ],
      custom: 579,
    },
  },
  {
    condition: {
      times: {gte: 10},
    },
    consequence: {
      message: [
        'times', {
          ref: 'times',
        },
        'should be less than 10',
      ],
      custom: 580,
    },
  },
];

run(rules, context);
