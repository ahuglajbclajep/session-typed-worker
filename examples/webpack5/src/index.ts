import { init, send, recv, close } from "../../../";
import * as proto from "./protocols";
const worker = new Worker(new URL("./worker.ts", import.meta.url));

(async () => {
  const p0 = (await init({
    M: self,
    W: worker,
  })) as proto.CheckNumbersEquality["M"];
  const p1 = send(p0, "W", "_", 42);
  const p2 = send(p1, "W", "_", 42);
  const p3 = await recv(p2, "W");
  switch (p3[0]) {
    case "_": {
      const [v, p4] = p3[1];
      close(p4);
      console.log(v);
    }
  }
})();
