export const counterFunc = (maxCount: number, context: { times: number },
                             runOpts: {validation: boolean, custom: {dryRun: boolean}}): boolean => {
    return context.times < maxCount;
};
