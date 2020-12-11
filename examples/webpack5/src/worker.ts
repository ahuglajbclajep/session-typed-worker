import { Merge, init, send, recv, close } from "../../../";
import { CheckNumbersEquality } from "./protocols";

(async () => {
  const p1 = (await init(self)) as Merge<CheckNumbersEquality["W"]>;
  const p2 = await recv(p1, "M");
  switch (p2[0]) {
    case "_": {
      const [v1, p3] = p2[1];
      const p4 = await recv(p3, "M");
      switch (p4[0]) {
        case "_": {
          const [v2, p5] = p4[1];
          const p6 = send(p5, "M", "_", v1 === v2);
          close(p6);
        }
      }
    }
  }
})();
