export const userFunc = async (user: string, context: { userId: string },
                               runOpts: {validation: boolean, custom: {dryRun: boolean}}): Promise<boolean> => {
    return context.userId === user;
};
