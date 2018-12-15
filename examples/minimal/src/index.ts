import { send, recv } from "session-typed-worker";
import * as protocols from "./protocols";
import Worker = require("worker-loader!./worker");

const p: protocols.Number2String["client"] = new Worker() as any;

(async () => {
  const p1 = send(p, 42);
  const [v, _] = await recv(p1);
  console.log(v, typeof v);
})();
