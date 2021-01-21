import { get, set } from "idb-keyval";
import { close, Init, init, receive, send } from "../../../";
import { Contents, G } from "./protocols";

(async () => {
  const p0 = (await init()) as Init<G["local"]>;
  while (true) {
    const p1 = await receive(p0, "remote");
    switch (p1.label) {
      case "save": {
        close(p1.port);
        await set("todoapp:contents", p1.value);
        break;
      }
      case "_": {
        const contents = (await get<Contents>("todoapp:contents")) ?? [];
        const l = Math.max(...contents.map((c) => c.createdAt));
        const r = Math.max(...p1.value.map((c) => c.createdAt));
        const latest = l < r ? p1.value : contents;
        const p2 = send(p1.port, "main", "latest", latest);
        close(p2);
      }
    }
  }
})();
