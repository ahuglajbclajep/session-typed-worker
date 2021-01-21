import { FunctionComponent, render } from "preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { close, init, Init, Local, receive, send } from "../../../";
import { AddTodo, Todo } from "./components";
import type { Contents, G } from "./protocols";
const remote = new Worker(new URL("./remote.ts", import.meta.url));
const local = new Worker(new URL("./local.ts", import.meta.url));

const App: FunctionComponent = () => {
  const [contents, setContents] = useState<Contents>([]);
  const p0 = useRef<Local>();

  useEffect(() => {
    (async () => {
      p0.current = await init({ main: window, remote, local });
    })();
  }, []);

  const addTodo = useCallback((todo: string) => {
    const createdAt = Date.now();
    setContents((prev) => [{ createdAt, todo }, ...prev]);
  }, []);

  const rmTodo = useCallback(
    (createdAt: number) => () => {
      setContents((prev) => prev.filter((c) => c.createdAt !== createdAt));
    },
    []
  );

  const push = useCallback(() => {
    const p1 = send(p0.current as Init<G["main"]>, "remote", "push", contents);
    close(p1);
  }, [p0.current, contents]);

  const pull = useCallback(async () => {
    const p1 = send(p0.current as Init<G["main"]>, "remote", "fetch", "");
    const p2 = await receive(p1, "local");
    close(p2.port);
    setContents(p2.value);
  }, [p0.current]);

  const items = contents.map((c) => (
    <Todo key={c.createdAt} todo={c.todo} rm={rmTodo(c.createdAt)} />
  ));
  return (
    <>
      <h1>todo</h1>
      <AddTodo add={addTodo} />
      <ul>{items}</ul>
      <button onClick={push}>push</button>
      <button onClick={pull}>pull</button>
    </>
  );
};

render(<App />, document.getElementById("root")!);
