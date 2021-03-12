import {Any} from 'ts-toolbelt';

export const getFromPath = <O extends object>(obj: O, path: string)
    : any => {
    const keys = path.split('.');
    return keys.reduce(
        (acc: any, key: Any.Key) => (acc === null || acc === undefined ? undefined : acc[key]),
        obj);
};

export const objectKeys = Object.keys as <T>(o: T) => (Extract<keyof T, string>)[];

export const assertUnreachable = <T = never>(x: never, message: string): T => {
    throw new Error(message);
};

export const getNumberAsserter = (key: string) => (value: any) => {
    if (typeof value !== 'number') {
        throw new Error(`Invalid expression - ${key} must be a number`);
    }
}
