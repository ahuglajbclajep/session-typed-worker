type IfIsEqual<X, Y, T, E> = [X] extends [Y] ? ([Y] extends [X] ? T : E) : E;

// see: https://github.com/piotrwitek/utility-types/blob/v3.10.0/src/mapped-types.ts#L620-L633
// see: https://qiita.com/suin/items/93eb9c328ee404fdfabc#comment-5218b3e9d13d93dfc98f
// UnionToIntersection<"A" | "A"> -> "A" & "A" -> "A"
// UnionToIntersection<"A" | "B"> -> "A" & "B" -> never
// UnionToIntersection<boolean> -> boolean
// UnionToIntersection<true | false> -> boolean
type UnionToIntersection<U> = IfIsEqual<
  U,
  boolean,
  boolean,
  (U extends any ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never
>;

// IfIsSingleton<"a" | "a", T, E> -> T
// IfIsSingleton<"a" | "b", T, E> -> E
// IfIsSingleton<string | number, T, E> -> E
type IfIsSingleton<U, T, E> = IfIsEqual<U, UnionToIntersection<U>, T, E>;

// see: https://github.com/millsp/ts-toolbelt/blob/v8.0.1/src/Union/Keys.ts
// see: https://github.com/microsoft/TypeScript/issues/41349
// AllKeys<{ x: ... } | { x: ...; y: ... }> -> "x" | ("x" | "y") -> "x" | "y"
type AllKeys<O extends Object> = O extends any ? keyof O : undefined;

export type { IfIsEqual, UnionToIntersection, IfIsSingleton, AllKeys };
