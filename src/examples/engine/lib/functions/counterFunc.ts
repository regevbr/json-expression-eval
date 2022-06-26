export const counterFunc =  (maxCount: number, context: { times: number }): boolean => {
    return context.times < maxCount;
};
