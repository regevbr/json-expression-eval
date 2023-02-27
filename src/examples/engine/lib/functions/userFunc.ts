export const userFunc = (user: string, context: { userId: string }
                         , runOpts: {validation: boolean, custom: {dryRun: boolean}}): boolean => {
    return context.userId === user;
};
