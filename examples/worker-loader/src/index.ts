import { Init, init, send, receive, close } from "../../../";
import { CheckNumbersEquality } from "./protocols";
import Worker from "worker-loader!./worker";
const worker = new Worker();

(async () => {
  const p0 = (await init({
    M: self,
    W: worker,
  })) as Init<CheckNumbersEquality["M"]>;
  const p1 = send(p0, "W", "_", 42);
  const p2 = send(p1, "W", "_", 42);
  const p3 = await receive(p2, "W");
  console.log(p3.value);
  close(p3.port);
})();
