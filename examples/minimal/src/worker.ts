import { send, recv } from "session-typed-worker";
import * as protocols from "./protocols";

const p: protocols.Number2String["worker"] = self as any;

(async () => {
  const [v, p1] = await recv(p);
  send(p1, v.toString(10));
})();
