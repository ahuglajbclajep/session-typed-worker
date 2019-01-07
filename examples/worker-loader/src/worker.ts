import { send, recv } from "session-typed-worker";
import * as proto from "./protocols";

const p: proto.CheckNumbersEquality["worker"] = self as any;

(async () => {
  const [v1, p1] = await recv(p);
  const [v2, p2] = await recv(p1);
  send(p2, v1 === v2);
})();
