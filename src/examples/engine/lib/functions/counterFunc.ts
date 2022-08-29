export const counterFunc = async (maxCount: number, context: { times: number }): Promise<boolean> => {
    return context.times < maxCount;
};
