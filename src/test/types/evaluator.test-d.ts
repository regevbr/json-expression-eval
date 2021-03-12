import {ExpressionEval} from '../../index';
import {expectError} from 'tsd';

type ExpressionFunction = {
    user: (user: string, context: { userId: string }) => boolean;
}

type Context = {
    timesCounter?: number;
    userId: string,
    nested: {
        value2: number | undefined,
        value: number | null,
    },
}

type BadValidationContext = {
    userId: string;
    nested: {
        value2: number;
        value: number;
    };
};

declare const validationContext: BadValidationContext;
declare const expressionEval: ExpressionEval<Context, ExpressionFunction>

expectError(expressionEval.validate(validationContext))
