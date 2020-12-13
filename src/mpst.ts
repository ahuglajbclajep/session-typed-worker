import type * as util from "./util";

type Local = { kind: "close" | "select" | "offer" };
type SelectLocals = { [key: string]: (v: never) => Local };
type OfferLocals = [string, [{}, Local]];

type Global = { [key: string]: Local };
type Globals = { [key: string]: [{}, Global] };

// Select<"A", { l1: (v: V1) => L1; l2: (v: V2) => L2; ... }>
interface Select<R extends string, LS> {
  kind: "select";
  role: (r: R) => void;
  branch: LS;
}

// Offer<"A", ["l1", [V1, L1]] | ["l2", [V2, L2]] | ...>
interface Offer<R extends string, LS> {
  kind: "offer";
  role: (r: R) => void;
  branch: LS;
}

interface Close {
  kind: "close";
}

interface MPSTError<Message, Cause> {
  message: Message;
  cause: Cause;
}

// To<"A", "B", { l1: [V1, G1]; l2: [V2, G2]; ... }>
type To<RS extends string, R1 extends RS, R2 extends RS, GS extends Globals> = {
  [R in RS]: R extends R1
    ? // Select<R2, { l1: (k: V1) => G1[R1]; l2: (k: V2) => G2[R1]; ... }>
      Select<R2, { [L in keyof GS]: (v: GS[L][0]) => GS[L][1][R1] }>
    : R extends R2
    ? // Offer<R1, ["l1", [V1, G1[R2]]] | ["l2", [V2, G2[R2]]] | ... >
      Offer<R1, { [L in keyof GS]: [L, [GS[L][0], GS[L][1][R2]]] }[keyof GS]>
    : // merge for an incomplete session type will cause an error in recursion, so do it last
      GS[keyof GS][1][R];
};

type Finish<RS extends string> = Record<RS, Close>;

type Init<LS extends Local> = Merge<LS>;

// see: https://github.com/microsoft/TypeScript/issues/29368
// Merge<Select<..., ...> | Select<..., ...>> -> Select<..., ...>
// Merge<Offer<..., ...> | Offer<..., ...>> -> Offer<..., ...>
// Merge<Close | Close> -> Close
// Merge<Select<..., ...> | Offer<..., ...>> -> `MPSTError<..., ...>
type Merge<LS extends Local> = [LS] extends [Select<never, SelectLocals>]
  ? MergeSelect<LS>
  : [LS] extends [Offer<never, OfferLocals>]
  ? MergeOffer<LS>
  : [LS] extends [Close]
  ? Close
  : MPSTError<"Merge: local type conflict", LS["kind"]>;

// MergeSelect<Select<"A", ...> | Select<"A", ...>> -> Select<"A", ...>
// MergeSelect<Select<"A", ...> | Select<"B", ...>> -> MPSTError<..., ...>
type MergeSelect<SS extends Select<never, SelectLocals>> =
  // (Select<"A", ...> | Select<"B", ...>)["role"] -> "A" | "B"
  util.IfIsSingleton<
    SS["role"],
    Select<Parameters<SS["role"]>[0], MergeSelectBranch<SS["branch"]>>,
    MPSTError<"Select: destination role conflict", Parameters<SS["role"]>[0]>
  >;

// MergeSelectBranch<{ l1: (v: V1) => L1 } | { l1: (v: V1) => L2 }> -> { l1: (v: V1) => Merge<L1 | L2> }
// MergeSelectBranch<{ l1: (v: V1) => L1 } | { l1: (v: V1) => L2; l2: (v: V2) => L3 }> -> MPSTError<..., ...>
// MergeSelectBranch<{ l1: (v: V1) => L1 } | { l1: (v: V2) => L2 }> -> MPSTError<..., ...>
type MergeSelectBranch<LS extends SelectLocals> = util.IfIsEqual<
  // keyof ({ l1: ... } | { l1: ...; l2: ... }) -> "l1"
  keyof LS,
  // AllKeys<{ l1: ... } | { l1: ...; l2: ... }> -> "l1" | "l2"
  util.AllKeys<LS>,
  // ({ l1: (v: V1) => L1; l2: (v: V2) => L2 } | { l1: (v: V3) => L3; l2: (v: V4) => L4 })["l1"] -> ((v: V1) => L1) | ((v: V3) => L3)
  {
    [L in util.AllKeys<LS>]: util.IfIsSingleton<
      Parameters<LS[L]>[0],
      (v: Parameters<LS[L]>[0]) => Merge<ReturnType<LS[L]>>,
      MPSTError<"SelectBranch: values differ", Parameters<LS[L]>[0]>
    >;
  },
  MPSTError<"SelectBranch: labels differ", util.AllKeys<LS>>
>;

// MergeOffer<Offer<"A", ...> | Offer<"A", ...>> -> Offer<"A", ...>
// MergeOffer<Offer<"A", ...> | Offer<"B", ...>> -> MPSTError<..., ...>
type MergeOffer<OS extends Offer<never, OfferLocals>> = util.IfIsSingleton<
  OS["role"],
  Offer<Parameters<OS["role"]>[0], MergeOfferBranch<OS["branch"]>>,
  MPSTError<"Offer: destination role conflict", Parameters<OS["role"]>[0]>
>;

// MergeOfferBranch<["l1", [V1, L1]] | ["l1", [V1, L2]] | ["l2", [V2, L3]]> -> ["l1", [v1, Merge<L1 | L2>]] | ["l2", [V2, Merge<L3>]]
// MergeOfferBranch<["l1", [V1, L1]] | ["l1", [V2, L2]]> -> MPSTError<..., ...>
type MergeOfferBranch<LS extends OfferLocals> =
  // `KS` is required for union distribution
  // (["l1", ...] | ["l2", ...] | ["l1", ...])[0] -> "l1" | "l2"
  LS[0] extends infer KS
    ? KS extends any
      ? util.IfIsSingleton<
          GetValues<LS, KS>[0],
          [KS, [GetValues<LS, KS>[0], Merge<GetValues<LS, KS>[1]>]],
          MPSTError<"OfferBranch: values differ", GetValues<LS, KS>[0]>
        >
      : never
    : never;

// GetValues<["l1", [V1, L1]] | ["l1", [V2, L2]] | ["l2", [V3, L3]], "l1"> -> [V1, L1] | [V2, L2]
type GetValues<LS, K> = LS extends [infer K0, infer L]
  ? util.IfIsEqual<K, K0, L, never>
  : never;

export type {
  To,
  Finish,
  Init,
  Globals,
  Merge,
  Select,
  Offer,
  Close,
  Local,
  SelectLocals,
  OfferLocals,
};
