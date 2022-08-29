export const userFunc = async (user: string, context: { userId: string }): Promise<boolean> => {
    return context.userId === user;
};
