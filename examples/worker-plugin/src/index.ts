import { Merge, init, send, recv, close } from "../../../";
import { CheckNumbersEquality } from "./protocols";
const worker = new Worker("./worker", { type: "module" });

(async () => {
  const p0 = (await init({
    M: self,
    W: worker,
  })) as Merge<CheckNumbersEquality["M"]>;
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
