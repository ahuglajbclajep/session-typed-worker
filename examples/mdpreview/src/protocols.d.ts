import { C2W, W2C, Fin } from "session-typed-worker";

type Md2Html = C2W<string, W2C<string, Fin>>;

export { Md2Html };
