import type * as util from "./util";
declare type Local = {
    kind: "close" | "select" | "offer";
};
declare type SelectLocals = {
    [key: string]: (v: never) => Local;
};
declare type OfferLocals = [string, [{}, Local]];
declare type Global = {
    [key: string]: Local;
};
declare type Globals = {
    [key: string]: [{}, Global];
};
interface Select<R extends string, LS> {
    kind: "select";
    role: (r: R) => void;
    branch: LS;
}
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
declare type To<R1 extends RS, R2 extends RS, GS extends Globals, RS extends string> = {
    [R in RS]: R extends R1 ? Select<R2, {
        [L in keyof GS]: (v: GS[L][0]) => GS[L][1][R1];
    }> : R extends R2 ? Offer<R1, {
        [L in keyof GS]: [L, [GS[L][0], GS[L][1][R2]]];
    }[keyof GS]> : Merge<GS[keyof GS][1][R]>;
};
declare type Finish<RS extends string> = Record<RS, Close>;
declare type Merge<LS extends Local> = [LS] extends [Select<never, SelectLocals>] ? MergeSelect<LS> : [LS] extends [Offer<never, OfferLocals>] ? MergeOffer<LS> : [LS] extends [Close] ? Close : MPSTError<"Merge: local type conflict", LS["kind"]>;
declare type MergeSelect<SS extends Select<never, SelectLocals>> = util.IfIsSingleton<SS["role"], Select<Parameters<SS["role"]>[0], MergeSelectBranch<SS["branch"]>>, MPSTError<"Select: destination role conflict", Parameters<SS["role"]>[0]>>;
declare type MergeSelectBranch<LS extends SelectLocals> = util.IfIsEqual<util.AllKeys<LS>, keyof LS, {
    [L in util.AllKeys<LS>]: util.IfIsSingleton<Parameters<LS[L]>[0], (v: Parameters<LS[L]>[0]) => Merge<ReturnType<LS[L]>>, MPSTError<"SelectBranch: values differ", Parameters<LS[L]>[0]>>;
}, MPSTError<"SelectBranch: labels differ", util.AllKeys<LS>>>;
declare type MergeOffer<OS extends Offer<never, OfferLocals>> = util.IfIsSingleton<OS["role"], Offer<Parameters<OS["role"]>[0], MergeOfferBranch<OS["branch"]>>, MPSTError<"Offer: destination role conflict", Parameters<OS["role"]>[0]>>;
declare type MergeOfferBranch<LS extends OfferLocals> = LS[0] extends infer KS ? KS extends any ? util.IfIsSingleton<GetValues<LS, KS>[0], [
    KS,
    [GetValues<LS, KS>[0], Merge<GetValues<LS, KS>[1]>]
], MPSTError<"OfferBranch: values differ", GetValues<LS, KS>[0]>> : never : never;
declare type GetValues<LS, K> = LS extends [infer K0, infer L] ? util.IfIsEqual<K, K0, L, never> : never;
export type { Select, Offer, Close, To, Finish, Local, SelectLocals, OfferLocals, };
