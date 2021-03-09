import {ExpressionParts} from '../expressionParts';
import {Any, O, Test} from 'ts-toolbelt';

interface ExpressionContext {
    str: string;
    num: number;
    bool: boolean;
    nested: {
        value: number;
        nested2: {
            value: string;
        };
    };
}

type ExpressionFunction = {
    strFn: (a: string, context: { str: string }) => boolean;
    numFn: (a: number, context: { str: string }) => boolean;
    boolFn: (a: boolean, context: { str: string }) => boolean;
    strArrFn: (a: string[], context: { str: string }) => boolean;
    numArrFn: (a: number[], context: { str: string }) => boolean;
    boolArrFn: (a: boolean[], context: { str: string }) => boolean;
};

type Result = O.Readonly<ExpressionParts<ExpressionContext, ExpressionFunction>, Any.Key, 'deep'>;

const expected = {
    nested: {
        value: {
            isArray: false,
            isFunction: false,
            propertyPath: 'nested.value',
            type: 'number',
        },
        nested2: {
            value: {
                isArray: false,
                isFunction: false,
                propertyPath: 'nested.nested2.value',
                type: 'string',
            },
        },
    },
    str: {
        isArray: false,
        isFunction: false,
        propertyPath: 'str',
        type: 'string',
    },
    strFn: {
        isArray: false,
        isFunction: true,
        propertyPath: 'strFn',
        type: 'string',
    },
    strArrFn: {
        isArray: true,
        isFunction: true,
        propertyPath: 'strArrFn',
        type: 'string',
    },
    num: {
        isArray: false,
        isFunction: false,
        propertyPath: 'num',
        type: 'number',
    },
    numFn: {
        isArray: false,
        isFunction: true,
        propertyPath: 'numFn',
        type: 'number',
    },
    numArrFn: {
        isArray: true,
        isFunction: true,
        propertyPath: 'numArrFn',
        type: 'number',
    },
    bool: {
        isArray: false,
        isFunction: false,
        propertyPath: 'bool',
        type: 'boolean',
    },
    boolFn: {
        isArray: false,
        isFunction: true,
        propertyPath: 'boolFn',
        type: 'boolean',
    },
    boolArrFn: {
        isArray: true,
        isFunction: true,
        propertyPath: 'boolArrFn',
        type: 'boolean',
    },
} as const;

type ResultExtended =
    O.Readonly<ExpressionParts<ExpressionContext, ExpressionFunction, { description: string }>, Any.Key, 'deep'>;

const expectedExtended = {
    nested: {
        value: {
            isArray: false,
            isFunction: false,
            propertyPath: 'nested.value',
            type: 'number',
            description: 'my desc' as string,
        },
        nested2: {
            value: {
                isArray: false,
                isFunction: false,
                propertyPath: 'nested.nested2.value',
                type: 'string',
                description: 'my desc' as string,
            },
        },
    },
    str: {
        isArray: false,
        isFunction: false,
        propertyPath: 'str',
        type: 'string',
        description: 'my desc' as string,
    },
    strFn: {
        isArray: false,
        isFunction: true,
        propertyPath: 'strFn',
        type: 'string',
        description: 'my desc' as string,
    },
    strArrFn: {
        isArray: true,
        isFunction: true,
        propertyPath: 'strArrFn',
        type: 'string',
        description: 'my desc' as string,
    },
    num: {
        isArray: false,
        isFunction: false,
        propertyPath: 'num',
        type: 'number',
        description: 'my desc' as string,
    },
    numFn: {
        isArray: false,
        isFunction: true,
        propertyPath: 'numFn',
        type: 'number',
        description: 'my desc' as string,
    },
    numArrFn: {
        isArray: true,
        isFunction: true,
        propertyPath: 'numArrFn',
        type: 'number',
        description: 'my desc' as string,
    },
    bool: {
        isArray: false,
        isFunction: false,
        propertyPath: 'bool',
        type: 'boolean',
        description: 'my desc' as string,
    },
    boolFn: {
        isArray: false,
        isFunction: true,
        propertyPath: 'boolFn',
        type: 'boolean',
        description: 'my desc' as string,
    },
    boolArrFn: {
        isArray: true,
        isFunction: true,
        propertyPath: 'boolArrFn',
        type: 'boolean',
        description: 'my desc' as string,
    },
} as const;

Test.checks([
    Test.check<Result, typeof expected, Test.Pass>(),
    Test.check<ResultExtended, typeof expectedExtended, Test.Pass>(),
]);
