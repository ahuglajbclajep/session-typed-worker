import { send, recv } from "session-typed-worker";
import * as proto from "./protocols";

declare class Worker {
  constructor(stringUrl: string, option: { type: "module" });
}
const worker = new Worker("./worker", { type: "module" });
const p: proto.CheckNumbersEquality["client"] = worker as any;

(async () => {
  const p1 = send(p, 42);
  const p2 = send(p1, 42);
  const [v, _] = await recv(p2);
  console.log(v); // true
})();
