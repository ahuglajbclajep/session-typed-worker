import type { Select, Offer, Close, Merge } from "./mpst";

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
// @dts-jest:pass:snap -> Select<"A", { a: MPSTError<"SelectBranch: values differ", string | number>; }>
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
