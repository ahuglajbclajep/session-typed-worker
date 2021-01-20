declare type IfIsEqual<X, Y, T, E> = [X] extends [Y] ? ([Y] extends [X] ? T : E) : E;
declare type UnionToIntersection<U> = IfIsEqual<U, boolean, boolean, (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never>;
declare type IfIsSingleton<U, T, E> = IfIsEqual<U, UnionToIntersection<U>, T, E>;
export type { IfIsEqual, IfIsSingleton };
