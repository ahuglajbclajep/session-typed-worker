interface Send<V, S> {
  kind: "send";
}
interface Recv<V, S> {
  kind: "recv";
}
interface Close {
  kind: "close";
}

type C2W<V, Cont extends { client: any; worker: any }> = {
  client: Send<V, Cont["client"]>;
  worker: Recv<V, Cont["worker"]>;
};
type W2C<V, Cont extends { client: any; worker: any }> = {
  client: Recv<V, Cont["client"]>;
  worker: Send<V, Cont["worker"]>;
};
type Fin = { client: Close; worker: Close };

function send<V, S>(port: Send<V, S>, value: V): S {
  ((port as any) as MessagePort).postMessage(value);
  return port as any;
}

function recv<V, S>(port: Recv<V, S>): Promise<[V, S]> {
  return new Promise(
    resolve =>
      (((port as any) as MessagePort).onmessage = e =>
        resolve([e.data, port as any]))
  );
}

function close(port: Close): void {}

export { C2W, W2C, Fin, send, recv, close };
