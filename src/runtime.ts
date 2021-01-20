import type {
  Select,
  Offer,
  Close,
  Local,
  SelectConts,
  OfferConts,
} from "./mpst";

type Message = [string, unknown];
type Ports = Record<string, MessagePort>;
type Context = { ports: Ports; queues: Record<string, Message[]> };
type Threads = Record<string, Window | Worker>;

async function init(threads?: Threads): Promise<Local> {
  let ports: Ports;
  if (!threads) {
    if (self.document)
      throw Error("cannot call the init function with no arguments in window.");
    ports = await new Promise(
      (resolve) =>
        ((self as DedicatedWorkerGlobalScope).onmessage = (e) =>
          resolve(e.data))
    );
  } else {
    const selves = Object.entries(threads).filter(([, t]) => t === self);
    if (selves.length !== 1)
      throw Error("cannot pass more than one 'self' to the init function.");
    const roleOfSelf = selves[0][0];

    let portMap: Record<string, Ports> = Object.fromEntries(
      Object.keys(threads).map((r) => [r, {}])
    );
    for (const r of Object.keys(threads)) {
      for (const s of Object.keys(threads)) {
        if (r === s) continue;
        if (!portMap[r][s]) {
          const { port1, port2 } = new MessageChannel();
          portMap[r][s] = port1;
          portMap[s][r] = port2;
        }
      }
    }
    Object.entries(threads)
      .filter(([, t]) => t !== self)
      .forEach(([r, t]) =>
        (t as Worker).postMessage(portMap[r], Object.values(portMap[r]))
      );
    ports = portMap[roleOfSelf];
  }

  const queues = Object.fromEntries(Object.keys(ports).map((r) => [r, []]));
  const context: Context = { ports, queues };
  Object.entries(ports).forEach(
    ([r, p]) => (p.onmessage = (e) => context.queues[r].push(e.data))
  );
  return context as any;
}

function send<
  Role extends string,
  Conts extends SelectConts,
  Label extends keyof Conts
>(
  port: Select<Role, Conts>,
  role: Role,
  label: Label,
  value: Parameters<Conts[Label]>[0]
): ReturnType<Conts[Label]> {
  ((port as any) as Context).ports[role].postMessage([label, value]);
  return port as any;
}

async function receive<Role extends string, Conts extends OfferConts>(
  port: Offer<Role, Conts>,
  role: Role
): Promise<ToObj<Conts>> {
  const { queues, ports } = (port as any) as Context;
  if (0 < queues[role].length) {
    const [label, value] = queues[role].shift()!;
    return { label, value, port } as any;
  }

  const onmessage = ports[role].onmessage;
  return new Promise(
    (resolve) =>
      (ports[role].onmessage = (e) => {
        ports[role].onmessage = onmessage;
        const [label, value] = e.data as Message;
        resolve({ label, value, port } as any);
      })
  );
}

// ["l1", [V1, L1]] | ["l2", [V2, L2]] ->
//   { label: "l1"; value: V1; port: L1 } | { label: "l2"; value: V2; port: L2 }
type ToObj<T extends OfferConts> = T extends any
  ? { label: T[0]; value: T[1][0]; port: T[1][1] }
  : never;

function close(port: Close) {}

export { init, send, receive, close };
