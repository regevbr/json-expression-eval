import {Any} from 'ts-toolbelt';

export const getFromPath = <O extends object>(obj: O, path: string)
    : { value: any, exists: boolean } => {
    const keys = path.split('.');
    let exists = keys.length > 0;
    const value = keys.reduce((acc: any, key: Any.Key) => {
        const accessible = acc !== null && acc !== undefined;
        exists = exists && accessible && key in acc;
        return accessible ? acc[key] : undefined;
    }, obj);
    return {value, exists};
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
