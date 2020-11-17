import type {
  Close,
  Finish,
  Offer,
  OfferLocals,
  Select,
  SelectLocals,
  To,
} from "./mpst";

declare function send<
  R extends string,
  LS extends SelectLocals,
  L extends keyof LS
>(
  channel: Select<R, LS>,
  role: R,
  label: L,
  value: Parameters<LS[L]>[0]
): ReturnType<LS[L]>;

declare function recv<R extends string, LS extends OfferLocals>(
  channel: Offer<R, LS>,
  role: R
): Promise<LS>;

declare function close(channel: Close): void;

export { send, recv, close, To, Finish };
