// see: https://github.com/microsoft/TypeScript/issues/29368
// "a", "a", T, E    -> T
// "a", "b", T, E    -> E
// "a", string, T, E -> E
type IfIsEqual<X, Y, T, E> = [X] extends [Y] ? ([Y] extends [X] ? T : E) : E;

// see: https://github.com/piotrwitek/utility-types/blob/v3.10.0/src/mapped-types.ts#L620-L633
// see: https://qiita.com/suin/items/93eb9c328ee404fdfabc#comment-5218b3e9d13d93dfc98f
// "A" | "A"    -> "A"
// "A" | "B"    -> never
// boolean      -> boolean
// true | false -> boolean
type UnionToIntersection<U> = IfIsEqual<
  U,
  boolean,
  boolean,
  (U extends any ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never
>;

// "a" | "a", T, E -> T
// "a" | "b", T, E -> E
type IfIsSingleton<U, T, E> = IfIsEqual<U, UnionToIntersection<U>, T, E>;

export type { IfIsEqual, IfIsSingleton };
