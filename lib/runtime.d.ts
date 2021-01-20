import type { Select, Offer, Close, Local, SelectConts, OfferConts } from "./mpst";
declare type Threads = Record<string, Window | Worker>;
declare function init(threads?: Threads): Promise<Local>;
declare function send<Role extends string, Conts extends SelectConts, Label extends keyof Conts>(port: Select<Role, Conts>, role: Role, label: Label, value: Parameters<Conts[Label]>[0]): ReturnType<Conts[Label]>;
declare function receive<Role extends string, Conts extends OfferConts>(port: Offer<Role, Conts>, role: Role): Promise<ToObj<Conts>>;
declare type ToObj<T extends OfferConts> = T extends any ? {
    label: T[0];
    value: T[1][0];
    port: T[1][1];
} : never;
declare function close(port: Close): void;
export { init, send, receive, close };
