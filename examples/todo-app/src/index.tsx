import { FunctionComponent, render } from "preact";
import { useCallback, useRef, useState } from "preact/hooks";
import type { Contents } from "./protocols";

const AddTodo: FunctionComponent<{ add: (todo: string) => void }> = (props) => {
  const ref = useRef<HTMLInputElement>();

  const handleClick = useCallback(() => {
    props.add(ref.current.value);
  }, [props.add, ref.current]);

  return (
    <>
      <input type="text" ref={ref} />
      <button onClick={handleClick}>add</button>
    </>
  );
};

const Todo: FunctionComponent<{
  todo: string;
  rm: () => void;
}> = (props) => {
  return <li onClick={props.rm}>{props.todo}</li>;
};

const App: FunctionComponent = () => {
  const [contents, setContents] = useState<Contents>([]);

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

  const items = contents.map((c) => (
    <Todo key={c.createdAt} todo={c.todo} rm={rmTodo(c.createdAt)} />
  ));
  return (
    <>
      <h1>todo</h1>
      <AddTodo add={addTodo} />
      <ul>{items}</ul>
    </>
  );
};

render(<App />, document.getElementById("root")!);
