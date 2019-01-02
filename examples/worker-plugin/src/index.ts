import { send, recv } from "session-typed-worker";
import * as proto from "./protocols";

const p: proto.CheckNumbersEquality["client"] = new (Worker as any)(
  "./worker",
  { type: "module" }
);

(async () => {
  const p1 = send(p, 42);
  const p2 = send(p1, 42);
  const [v, _] = await recv(p2);
  console.log(v); // true
})();
