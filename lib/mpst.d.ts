import type * as util from "./util";
declare type Local = {
    _tag: "close" | "select" | "offer";
};
declare type SelectConts = {
    [label: string]: (v: never) => Local;
};
declare type OfferConts = [string, [{}, Local]];
declare type Global = {
    [role: string]: Local;
};
declare type Globals = {
    [label: string]: [{}, Global];
};
interface Select<Role extends string, Conts> {
    _tag: "select";
    role: (r: Role) => void;
    conts: Conts;
}
interface Offer<Role extends string, Conts> {
    _tag: "offer";
    role: (r: Role) => void;
    conts: Conts;
}
interface Close {
    _tag: "close";
}
declare type CommBase<Roles extends string, Role1 extends Roles, Role2 extends Roles, Conts extends Globals> = {
    [Role in Roles]: Role extends Role1 ? Select<Role2, {
        [L in keyof Conts]: (v: Conts[L][0]) => Conts[L][1][Role];
    }> : Role extends Role2 ? Offer<Role1, {
        [L in keyof Conts]: [L, [Conts[L][0], Conts[L][1][Role]]];
    }[keyof Conts]> : Conts[keyof Conts][1][Role];
};
interface MergeError<Message, Reason> {
    message: Message;
    reason: Reason;
}
declare type EndBase<RS extends string> = Record<RS, Close>;
declare type Init<Locals extends Local> = Merge<Locals>;
declare type Merge<Locals extends Local> = [Locals] extends [Select<never, SelectConts>] ? MergeSelect<Locals> : [Locals] extends [Offer<never, OfferConts>] ? MergeOffer<Locals> : [Locals] extends [Close] ? Close : MergeError<"Merge: local type conflict", Locals["_tag"]>;
declare type MergeSelect<Selects extends Select<never, SelectConts>> = util.IfIsSingleton<Selects["role"], Select<Parameters<Selects["role"]>[0], MergeSelectBranch<Selects["conts"]>>, MergeError<"Select: destination role conflict", Parameters<Selects["role"]>[0]>>;
declare type MergeSelectBranch<Conts extends SelectConts> = util.IfIsEqual<keyof Conts, // { l1: ... } | { l1: ...; l2: ... } -> "l1"
AllLabels<Conts>, // { l1: ... } | { l1: ...; l2: ... } -> "l1" | "l2"
{
    [L in AllLabels<Conts>]: util.IfIsSingleton<Parameters<Conts[L]>[0], // V1
    (v: Parameters<Conts[L]>[0]) => Merge<ReturnType<Conts[L]>>, MergeError<"SelectBranch: values differ", Parameters<Conts[L]>[0]>>;
}, MergeError<"SelectBranch: labels differ", AllLabels<Conts>>>;
declare type AllLabels<Conts> = Conts extends any ? keyof Conts : undefined;
declare type MergeOffer<Offers extends Offer<never, OfferConts>> = util.IfIsSingleton<Offers["role"], Offer<Parameters<Offers["role"]>[0], MergeOfferBranch<Offers["conts"]>>, MergeError<"Offer: destination role conflict", Parameters<Offers["role"]>[0]>>;
declare type MergeOfferBranch<Conts extends OfferConts> = Conts[0] extends infer LS ? LS extends any ? util.IfIsSingleton<GetPairs<Conts, LS>[0], // ex. V1
[
    LS,
    [GetPairs<Conts, LS>[0], Merge<GetPairs<Conts, LS>[1]>]
], MergeError<"OfferBranch: values differ", GetPairs<Conts, LS>[0]>> : never : never;
declare type GetPairs<Conts, Label> = Conts extends [infer Label0, infer Pair] ? util.IfIsEqual<Label, Label0, Pair, never> : never;
export type { CommBase, EndBase, Init, Globals, Merge, Select, Offer, Close, Local, SelectConts, OfferConts, };
