import { C2W, W2C, Fin } from "session-typed-worker";

type Number2String = C2W<number, W2C<string, Fin>>;

export { Number2String };
