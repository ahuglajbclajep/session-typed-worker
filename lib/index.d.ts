interface Send<V, S> {
    kind: "send";
}
interface Recv<V, S> {
    kind: "recv";
}
interface Close {
    kind: "close";
}
declare type C2W<V, Cont extends {
    client: any;
    worker: any;
}> = {
    client: Send<V, Cont["client"]>;
    worker: Recv<V, Cont["worker"]>;
};
declare type W2C<V, Cont extends {
    client: any;
    worker: any;
}> = {
    client: Recv<V, Cont["client"]>;
    worker: Send<V, Cont["worker"]>;
};
declare type Fin = {
    client: Close;
    worker: Close;
};
declare function send<V, S>(port: Send<V, S>, value: V): S;
declare function recv<V, S>(port: Recv<V, S>): Promise<[V, S]>;
declare function close(port: Close): void;
export { C2W, W2C, Fin, send, recv, close };
