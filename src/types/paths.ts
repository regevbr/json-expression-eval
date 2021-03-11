import {Any, List, Misc, Union} from 'ts-toolbelt';
import {NonNullableFlat} from 'ts-toolbelt/out/Object/NonNullable';

type UnionOf<A> =
    A extends List.List
        ? A[number]
        : Union.Exclude<A[keyof A], undefined>

type _PathsRequired<O, P extends List.List, Ignore, K extends Any.Key> = UnionOf<{
    [k in keyof O]: k extends K ?
        O[k] extends Misc.BuiltIn | Misc.Primitive | Ignore ? NonNullableFlat<[...P, k]> :
            [Any.Keys<O[k]>] extends [never] ? NonNullableFlat<[...P, k]> :
                12 extends List.Length<P> ? NonNullableFlat<[...P, k]> :
                    _PathsRequired<O[k], [...P, k], Ignore, K> : never
}>

export type Paths<O, P extends List.List = [], Ignore = never, K extends Any.Key = Any.Key> =
    _PathsRequired<O, P, Ignore, K> extends infer X
        ? Any.Cast<X, List.List<K>>
        : never
