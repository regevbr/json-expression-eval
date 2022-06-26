import {ResolvedConsequence} from '../../../../types';

export const userRule = (user: string, context: { userId: string }): void | ResolvedConsequence<number> => {
  if (context.userId === user) {
    return {
      message: `Username ${user} is not allowed`,
      custom: 543,
    }
  }
};