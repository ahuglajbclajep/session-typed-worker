import type { FunctionComponent } from "preact";
import { useCallback, useRef } from "preact/hooks";

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

export { AddTodo, Todo };
