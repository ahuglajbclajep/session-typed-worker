import type { Select, Offer, Close, Merge, Finish, Globals, To } from "./mpst";

///////////////////////////// test cases of merge /////////////////////////////

declare const ms0: Merge<
  | Select<"A", { a: (v: string) => Close }>
  | Select<"A", { a: (v: string) => Close }>
>;
// @dts-jest:pass:snap Select<"A", { a: (v: string) => Close }>
ms0;

declare const ms1: Merge<
  | Select<"A", { a: (v: string) => Close }>
  | Select<"B", { a: (v: string) => Close }>
>;
// @dts-jest:pass:snap MPSTError < "Select: destination role conflict", "A" | "B" >
ms1;

declare const ms2: Merge<
  | Select<"A", { a: (v: string) => Close }>
  | Select<"A", { b: (v: string) => Close }>
>;
// @dts-jest:pass:snap Select<"A", MPSTError<"SelectBranch: labels differ", "a" | "b">>
ms2;

declare const ms3: Merge<
  | Select<"A", { a: (v: string) => Close }>
  | Select<"A", { a: (v: number) => Close }>
>;
// @dts-jest:pass:snap Select<"A", { a: MPSTError<"SelectBranch: values differ", string | number>; }>
ms3;

declare const mo0: Merge<
  Offer<"A", ["a", [string, Close]]> | Offer<"A", ["a", [string, Close]]>
>;
// @dts-jest:pass:snap Offer<"A", ["a", [string, Close]]>
mo0;

declare const mo1: Merge<
  Offer<"A", ["a", [string, Close]]> | Offer<"B", ["a", [string, Close]]>
>;
// @dts-jest:pass:snap MPSTError<"Offer: destination role conflict", "A" | "B">
mo1;

declare const mo2: Merge<
  Offer<"A", ["a", [string, Close]]> | Offer<"A", ["b", [string, Close]]>
>;
// @dts-jest:pass:snap Offer<"A", ["a", [string, Close]] | ["b", [string, Close]]>
mo2;

declare const mo3: Merge<
  Offer<"A", ["a", [string, Close]]> | Offer<"A", ["a", [number, Close]]>
>;
// @dts-jest:pass:snap Offer<"A", MPSTError<"OfferBranch: values differ", string | number>>
mo3;

declare const mc0: Merge<Close | Close>;
// @dts-jest:pass:snap Close
mc0;

declare const me0: Merge<
  Select<"A", { a: (v: string) => Close }> | Offer<"A", ["a", [string, Close]]>
>;
// @dts-jest:pass:snap MPSTError<"Merge: local type conflict", "select" | "offer">
me0;

////////////////////////// test cases of global type //////////////////////////

type Roles = "A" | "B" | "C";
type FinishABC = Finish<Roles>;
type AtoB<GS extends Globals> = To<"A", "B", GS, Roles>;
type BtoC<GS extends Globals> = To<"B", "C", GS, Roles>;
type CtoA<GS extends Globals> = To<"C", "A", GS, Roles>;

type G0 = AtoB<{
  a: [{}, BtoC<{ a1: [string, CtoA<{ a2: [boolean, FinishABC] }>] }>];
  b: [{}, BtoC<{ b1: [{}, FinishABC] }>];
}>;

declare const g0a: G0["A"];
// @dts-jest:pass:snap Select<"B", { a: (v: {}) => Offer<"C", ["a2", [boolean, Close]]>; b: (v: {}) => Close }>
g0a;

declare const g0b: G0["B"];
// @dts-jest:pass:snap G0["B"]
g0b;

declare const g0c: G0["C"];
// @dts-jest:pass:snap Offer<"B", ["a1", [string, Select<"A", { a2: (v: boolean) => Close }>]] | ["b1", [{}, Close]]>
g0c;

type G1 = AtoB<{
  a: [{}, BtoC<{ a1: [string, CtoA<{ a2: [boolean, G1] }>] }>];
  b: [{}, BtoC<{ a1: [{}, FinishABC] }>];
}>;

declare const g1a: G1["A"];
// @dts-jest:pass:snap G1["A"]
g1a;

declare const g1b: G1["B"];
// @dts-jest:pass:snap G1["B"]
g1b;

declare const g1c: G1["B"];
// @dts-jest:pass:snap G1["B"]
g1b;

type CtoB<GS extends Globals> = To<"C", "B", GS, Roles>;
type G2 = AtoB<{
  a: [{}, BtoC<{ a1: [string, CtoA<{ a2: [boolean, FinishABC] }>] }>];
  b: [{}, CtoB<{ b1: [{}, FinishABC] }>];
}>;
declare const g2c: G2["C"];
// @dts-jest:pass:snap MPSTError<"Merge: local type conflict", "offer" | "select">
g2c;

type G3 = AtoB<{
  a: [{}, BtoC<{ a1: [string, CtoA<{ a2: [boolean, FinishABC] }>] }>];
  b: [{}, BtoC<{ a1: [{}, FinishABC] }>];
}>;
declare const g3c: G3["C"];
// @dts-jest:pass:snap Offer<"B", MPSTError<"OfferBranch: values differ", string | {}>>
g3c;

type FinishAB = Finish<"A" | "B">;
type G4 = AtoB<{
  a: [{}, BtoC<{ a1: [string, CtoA<{ a2: [boolean, FinishABC] }>] }>];
  b: [{}, BtoC<{ b1: [{}, FinishAB] }>];
}>;
declare const g4c: G4["C"];
// @dts-jest:pass:snap MPSTError<"Merge: local type conflict", "offer">
g4c;
