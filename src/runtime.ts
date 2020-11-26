import type {
  Local,
  Select,
  SelectLocals,
  Offer,
  OfferLocals,
  Close,
} from "./mpst";

type Message = [string, unknown];
type Ports = Record<string, MessagePort>;
type Context = { ports: Ports; queues: Record<string, Message[]> };

type Workers = Record<string, Window | Worker>;
type SelfOrWorkers = DedicatedWorkerGlobalScope | Workers;

async function init(selfOrWorkers: SelfOrWorkers): Promise<Local> {
  let ports: Ports;
  if (selfOrWorkers === self) {
    if (self.document)
      throw Error("The window is passed directly to the init function.");
    ports = await new Promise(
      (resolve) => (selfOrWorkers.onmessage = (e) => resolve(e.data))
    );
  } else {
    const workers = selfOrWorkers as Workers;
    const selves = Object.entries(workers).filter(([, w]) => w === self);
    if (selves.length !== 1)
      throw Error("Only one self can be passed to the init function.");
    const roleOfSelf = selves[0][0];

    let portMap: Record<string, Ports> = Object.fromEntries(
      Object.keys(workers).map((r) => [r, {}])
    );
    for (const k of Object.keys(workers)) {
      for (const l of Object.keys(workers)) {
        if (k === l) continue;
        if (!portMap[k][l]) {
          const { port1, port2 } = new MessageChannel();
          portMap[k][l] = port1;
          portMap[l][k] = port2;
        }
      }
    }
    Object.entries(workers)
      .filter(([, w]) => w !== self)
      .forEach(([r, w]) =>
        (w as Worker).postMessage(portMap[r], Object.values(portMap[r]))
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

function send<R extends string, LS extends SelectLocals, L extends keyof LS>(
  port: Select<R, LS>,
  role: R,
  label: L,
  value: Parameters<LS[L]>[0]
): ReturnType<LS[L]> {
  ((port as any) as Context).ports[role].postMessage([label, value]);
  return port as any;
}

async function recv<R extends string, LS extends OfferLocals>(
  port: Offer<R, LS>,
  role: R
): Promise<LS> {
  const { queues, ports } = (port as any) as Context;
  if (0 < queues[role].length) {
    const [label, value] = queues[role].shift()!;
    return [label, [value, port]] as any;
  }

  const onmessage = ports[role].onmessage;
  return new Promise(
    (resolve) =>
      (ports[role].onmessage = (e) => {
        ports[role].onmessage = onmessage;
        const [label, value] = e.data as Message;
        resolve([label, [value, port]] as any);
      })
  );
}

function close(channel: Close) {}

export { init, send, recv, close };
