import {ResolvedConsequence} from '../../../../types';

export const userRule = async (user: string, context: { userId: string },
                               runOpts: {validation: boolean, custom: {dryRun: boolean}})
    : Promise<void | ResolvedConsequence<number>> => {
  if (context.userId === user) {
    return {
      message: `Username ${user} is not allowed`,
      custom: 543,
    }
  }
};
