import { close, Init, init, receive, send } from "../../../";
import { G } from "./protocols";

(async () => {
  const p0 = (await init()) as Init<G["remote"]>;
  while (true) {
    const p1 = await receive(p0, "main");
    switch (p1.label) {
      case "push": {
        const contents = p1.value;
        const p2 = send(p1.port, "local", "save", contents);
        close(p2);
        // TODO: POST contents
        break;
      }
      case "fetch": {
        // TODO: GET contents
        const contents = [{ createdAt: 42, todo: "dummy" }];
        const p2 = send(p1.port, "local", "_", contents);
        close(p2);
      }
    }
  }
})();
