import { close, Init, init, receive, send } from "../../../";
import { Contents, G } from "./protocols";

(async () => {
  const p0 = (await init()) as Init<G["remote"]>;
  while (true) {
    const p1 = await receive(p0, "main");
    switch (p1.label) {
      case "push": {
        const contents = p1.value;
        const p2 = send(p1.port, "local", "save", contents);
        close(p2);
        await fetch("/api", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contents),
        }).catch((e) => console.log(`POST /api ${e}`));
        break;
      }
      case "fetch": {
        const contents: Contents = await fetch("/api")
          .then((res) => res.json())
          .catch((e) => console.log(`GET /api ${e}`));
        const p2 = send(p1.port, "local", "_", contents ?? []);
        close(p2);
      }
    }
  }
})();
