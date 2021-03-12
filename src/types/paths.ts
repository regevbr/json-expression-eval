import {Any, List, Misc} from 'ts-toolbelt';
import {NonNullableFlat} from 'ts-toolbelt/out/Object/NonNullable';

type PathMode = 'compact' | 'all' | 'required'

type UnionOf<A> =
    A extends List.List
        ? A[number]
        : A[keyof A]

type _PathsCompact<O, P extends List.List, Ignore, K extends Any.Key> = UnionOf<{
    [k in keyof O]: k extends K ?
        O[k] extends Misc.BuiltIn | Misc.Primitive | Ignore ? NonNullableFlat<[...P, k?]> :
            [Any.Keys<O[k]>] extends [never] ? NonNullableFlat<[...P, k?]> :
                12 extends List.Length<P> ? NonNullableFlat<[...P, k?]> :
                    _PathsCompact<O[k], [...P, k?], Ignore, K> : never
}>

type _PathsRequired<O, P extends List.List, Ignore, K extends Any.Key> = UnionOf<{
    [k in keyof O]: k extends K ?
        O[k] extends Misc.BuiltIn | Misc.Primitive | Ignore ? NonNullableFlat<[...P, k]> :
            [Any.Keys<O[k]>] extends [never] ? NonNullableFlat<[...P, k]> :
                12 extends List.Length<P> ? NonNullableFlat<[...P, k]> :
                    _PathsRequired<O[k], [...P, k], Ignore, K> : never
}>

type _PathsAll<O, P extends List.List, Ignore, K extends Any.Key> = UnionOf<{
    [k in keyof O]: k extends K ?
        O[k] extends Misc.BuiltIn | Misc.Primitive | Ignore ? NonNullableFlat<[...P, k]> :
            [Any.Keys<O[k]>] extends [never] ? NonNullableFlat<[...P, k]> :
                12 extends List.Length<P> ? NonNullableFlat<[...P, k]> :
                    NonNullableFlat<[...P, k]> | _PathsAll<O[k], [...P, k], Ignore, K> : never
}>

type _Paths<O, P extends List.List, M extends PathMode, Ignore, K extends Any.Key> = {
    compact: _PathsCompact<O, P, Ignore, K>;
    required: _PathsRequired<O, P, Ignore, K>;
    all: _PathsAll<O, P, Ignore, K>;
}[M]

// TODO replace with Paths from new ts-version once PR https://github.com/millsp/ts-toolbelt/pull/222 is merged
export type Paths<O, P extends List.List = [],
    M extends PathMode = 'compact', Ignore = never, K extends Any.Key = Any.Key> =
    _Paths<O, P, M, Ignore, K> extends infer X
        ? Any.Cast<X, List.List<K>>
        : never
