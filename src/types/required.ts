import { BuiltIn } from './utils';

type _NonNullable<O, Ignore> = {
    [K in keyof O]-?: O[K] extends BuiltIn | Ignore
        ? O[K]
        : O[K] extends object
            ? _NonNullable<globalThis.NonNullable<O[K]>, Ignore>
            : globalThis.NonNullable<O[K]>
}

export type NonNullable<O extends object, Ignore = never> =
    O extends unknown
        ? _NonNullable<O, Ignore>
        : never
