import { close, Init, init, receive, send } from "../../../";
import { G } from "./protocols";

(async () => {
  const p0 = (await init()) as Init<G["local"]>;
  while (true) {
    const p1 = await receive(p0, "remote");
    switch (p1.label) {
      case "save": {
        // TODO: save contents
        close(p1.port);
        break;
      }
      case "_": {
        const contents = p1.value;
        // TODO : compare contents
        const p2 = send(p1.port, "main", "latest", contents);
        close(p2);
      }
    }
  }
})();
