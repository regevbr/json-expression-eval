export const userFunc = (user: string, context: { userId: string }): boolean => {
    return context.userId === user;
};
