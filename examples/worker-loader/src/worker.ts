import { Init, init, send, receive, close } from "../../../";
import { CheckNumbersEquality } from "./protocols";

(async () => {
  const p1 = (await init()) as Init<CheckNumbersEquality["W"]>;
  const p2 = await receive(p1, "M");
  const v1 = p2.value;
  const p3 = await receive(p2.port, "M");
  const v2 = p3.value;
  const p4 = send(p3.port, "M", "_", v1 === v2);
  close(p4);
})();
