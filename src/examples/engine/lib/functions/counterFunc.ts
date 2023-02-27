export const counterFunc = async (maxCount: number, context: { times: number },
                                  runOpts: {validation: boolean, custom: {dryRun: boolean}}): Promise<boolean> => {
    return context.times < maxCount;
};
