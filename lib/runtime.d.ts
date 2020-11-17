import type { Local, Select, SelectLocals, Offer, OfferLocals, Close } from "./mpst";
declare type Workers = Record<string, Window | Worker>;
declare type SelfOrWorkers = DedicatedWorkerGlobalScope | Workers;
declare function init(selfOrWorkers: SelfOrWorkers): Promise<Local>;
declare function send<R extends string, LS extends SelectLocals, L extends keyof LS>(channel: Select<R, LS>, role: R, label: L, value: Parameters<LS[L]>[0]): ReturnType<LS[L]>;
declare function recv<R extends string, LS extends OfferLocals>(channel: Offer<R, LS>, role: R): Promise<LS>;
declare function close(channel: Close): void;
export { init, send, recv, close };
