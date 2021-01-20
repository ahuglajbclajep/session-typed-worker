import type * as util from "./util";

type Local = { _tag: "close" | "select" | "offer" };
type SelectConts = { [label: string]: (v: never) => Local };
type OfferConts = [string, [{}, Local]];

type Global = { [role: string]: Local };
type Globals = { [label: string]: [{}, Global] };

// Select<"a", { l1: (v: V1) => L1; l2: (v: V2) => L2; ... }>
interface Select<Role extends string, Conts> {
  _tag: "select";
  role: (r: Role) => void;
  conts: Conts;
}

// Offer<"a", ["l1", [V1, L1]] | ["l2", [V2, L2]] | ...>
interface Offer<Role extends string, Conts> {
  _tag: "offer";
  role: (r: Role) => void;
  conts: Conts;
}

interface Close {
  _tag: "close";
}

// CommBase<"a", "b", { l1: [V1, G1]; l2: [V2, G2]; ... }>
type CommBase<
  Roles extends string,
  Role1 extends Roles,
  Role2 extends Roles,
  Conts extends Globals
> = {
  [Role in Roles]: Role extends Role1
    ? Select<
        Role2,
        // { l1: (v: V1) => G1[Role1]; l2: (v: V2) => G2[Role1]; ... }
        { [L in keyof Conts]: (v: Conts[L][0]) => Conts[L][1][Role] }
      >
    : Role extends Role2
    ? Offer<
        Role1,
        // ["l1", [V1, G1[Role2]]] | ["l2", [V2, G2[Role2]]] | ...
        {
          [L in keyof Conts]: [L, [Conts[L][0], Conts[L][1][Role]]];
        }[keyof Conts]
      >
    : // merge for an incomplete session type will cause an error in recursion, so do it last
      Conts[keyof Conts][1][Role]; // G1[Role] | G2[Role]
};

interface MergeError<Message, Reason> {
  message: Message;
  reason: Reason;
}

type EndBase<RS extends string> = Record<RS, Close>;

type Init<Locals extends Local> = Merge<Locals>;

// see: https://github.com/microsoft/TypeScript/issues/29368
// Select<...> | Select<...> -> Select<...>
// Offer<...> | Offer<...>   -> Offer<...>
// Close | Close             -> Close
// Select<...> | Offer<...>  -> MergeError<...>
type Merge<Locals extends Local> = [Locals] extends [Select<never, SelectConts>]
  ? MergeSelect<Locals>
  : [Locals] extends [Offer<never, OfferConts>]
  ? MergeOffer<Locals>
  : [Locals] extends [Close]
  ? Close
  : MergeError<"Merge: local type conflict", Locals["_tag"]>;

// Select<"a", C1> | Select<"a", C2> -> Select<"a", ...>
// Select<"a", C1> | Select<"b", C2> -> MergeError<...>
type MergeSelect<
  Selects extends Select<never, SelectConts>
> = util.IfIsSingleton<
  Selects["role"],
  // Select<"a", MergeSelectBranch<C1 | C2>>
  Select<Parameters<Selects["role"]>[0], MergeSelectBranch<Selects["conts"]>>,
  MergeError<
    "Select: destination role conflict",
    Parameters<Selects["role"]>[0]
  >
>;

// { l1: (v: V1) => L1 } | { l1: (v: V1) => L2 } -> { l1: (v: V1) => ... }
// { l1: (v: V1) => L1 } | { l1: (v: V1) => L2; l2: ... }> -> MergeError<...>
// { l1: (v: V1) => L1 } | { l1: (v: V2) => L2 } -> { l1: MergeError<...> }
type MergeSelectBranch<Conts extends SelectConts> = util.IfIsEqual<
  keyof Conts, // { l1: ... } | { l1: ...; l2: ... } -> "l1"
  util.AllKeys<Conts>, // { l1: ... } | { l1: ...; l2: ... } -> "l1" | "l2"
  {
    [L in util.AllKeys<Conts>]: util.IfIsSingleton<
      Parameters<Conts[L]>[0], // V1
      // (v: V1) => Merge<L1 | L2>
      (v: Parameters<Conts[L]>[0]) => Merge<ReturnType<Conts[L]>>,
      MergeError<"SelectBranch: values differ", Parameters<Conts[L]>[0]>
    >;
  },
  MergeError<"SelectBranch: labels differ", util.AllKeys<Conts>>
>;

// Offer<"a", C1> | Offer<"a", C2> -> Offer<"a", ...>
// Offer<"a", C1> | Offer<"b", C2> -> MergeError<...>
type MergeOffer<Offers extends Offer<never, OfferConts>> = util.IfIsSingleton<
  Offers["role"],
  // Offer<"a", MergeOfferBranch<C1 | C2>>
  Offer<Parameters<Offers["role"]>[0], MergeOfferBranch<Offers["conts"]>>,
  MergeError<"Offer: destination role conflict", Parameters<Offers["role"]>[0]>
>;

// ["l1", [V1, L1]] | ["l1", [V1, L2]] | ["l3", [V3, L3]]
//   -> ["l1", [V1, Merge<L1 | L2>]] | ["l3", [V3, Merge<L3>]]
// ["l1", [V1, L1]] | ["l1", [V2, L2]] -> MergeError<...>
type MergeOfferBranch<Conts extends OfferConts> =
  // LS is required for union distribution
  Conts[0] extends infer LS // "l1" | "l3"
    ? LS extends any // ex. "l1"
      ? util.IfIsSingleton<
          GetPairs<Conts, LS>[0], // ex. V1
          // ex. ["l1", [V1, Merge<L1 | L2>]]
          [LS, [GetPairs<Conts, LS>[0], Merge<GetPairs<Conts, LS>[1]>]],
          MergeError<"OfferBranch: values differ", GetPairs<Conts, LS>[0]>
        >
      : never
    : never;

// ["l1", P1] | ["l1", P2], "l1" -> P1 | P2
// ["l1", P1] | ["l2", P2], "l1" -> P1
type GetPairs<Conts, Label> = Conts extends [infer Label0, infer Pair]
  ? util.IfIsEqual<Label, Label0, Pair, never>
  : never;

export type {
  CommBase,
  EndBase,
  Init,
  Globals,
  Merge,
  Select,
  Offer,
  Close,
  Local,
  SelectConts,
  OfferConts,
};
