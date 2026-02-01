import { BuiltIn, Cast, Keys, List, NonNullableFlat, Primitive } from './utils';

type UnionOf<A> =
    A extends List
        ? A[number]
        : Exclude<A[keyof A], undefined>

type _PathsRequired<O, P extends List, Ignore, K extends PropertyKey> = UnionOf<{
    [k in keyof O]: k extends K ?
        O[k] extends BuiltIn | Primitive | Ignore ? NonNullableFlat<[...P, k]> :
            [Keys<O[k]>] extends [never] ? NonNullableFlat<[...P, k]> :
                12 extends P['length'] ? NonNullableFlat<[...P, k]> :
                    _PathsRequired<O[k], [...P, k], Ignore, K> : never
}>

export type Paths<O, P extends List = [], Ignore = never, K extends PropertyKey = PropertyKey> =
    _PathsRequired<O, P, Ignore, K> extends infer X
        ? Cast<X, List<K>>
        : never
