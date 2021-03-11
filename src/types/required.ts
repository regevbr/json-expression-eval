import {Union, Misc} from 'ts-toolbelt'

type _NonNullable<O, Ignore> = {
    [K in keyof O]-?: O[K] extends Misc.BuiltIn | Ignore
        ? O[K]
        : _NonNullable<Union.NonNullable<O[K]>, Ignore>
}

export type NonNullable<O extends object, Ignore = never> =
    O extends unknown
        ? _NonNullable<O, Ignore>
        : never
