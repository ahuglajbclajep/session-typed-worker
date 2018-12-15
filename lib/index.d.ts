interface Port {
    postMessage: MessagePort["postMessage"];
    onmessage: MessagePort["onmessage"] | Worker["onmessage"];
}
interface Send<V, S> extends Port {
    kind: "send";
    value: V;
    cont: S;
}
interface Recv<V, S> extends Port {
    kind: "recv";
    value: V;
    cont: S;
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
export { C2W, W2C, Fin, send, recv };
