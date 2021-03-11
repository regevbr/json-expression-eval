import {Any} from 'ts-toolbelt';

export const getFromPath = <O extends object>(obj: O, path: string)
    : any => {
    const keys = path.split('.');
    return keys.reduce(
        (acc: any, key: Any.Key) => (acc === null || acc === undefined ? undefined : acc[key]),
        obj);
};
