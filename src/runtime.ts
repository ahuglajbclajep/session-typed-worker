import type { Select, SelectLocals, Offer, OfferLocals, Close } from "./mpst";

type Message = [string, unknown];
type Ports = Record<string, MessagePort>;
type Context = { ports: Ports; queues: Record<string, Message[]> };

type Workers = Record<string, Window | Worker>;
type SelfOrWorkers = DedicatedWorkerGlobalScope | Workers;

async function init(selfOrWorkers: SelfOrWorkers) {
  let ports: Ports;
  if (selfOrWorkers === self) {
    ports = await new Promise(
      (resolve) => (selfOrWorkers.onmessage = (e) => resolve(e.data))
    );
  } else {
    const workers = selfOrWorkers as Workers;
    const selves = Object.entries(workers).filter(([, w]) => w === self);
    if (selves.length !== 1) return;
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
  return context;
}

function send<R extends string, LS extends SelectLocals, L extends keyof LS>(
  channel: Select<R, LS>,
  role: R,
  label: L,
  value: Parameters<LS[L]>[0]
): ReturnType<LS[L]> {
  ((channel as any) as Context).ports[role].postMessage([label, value]);
  return channel as any;
}

async function recv<R extends string, LS extends OfferLocals>(
  channel: Offer<R, LS>,
  role: R
): Promise<LS> {
  const { queues, ports } = (channel as any) as Context;
  if (0 < queues[role].length) return queues[role].shift() as any;
  const onmessage = ports[role].onmessage;
  return new Promise(
    (r) =>
      (ports[role].onmessage = (e: MessageEvent<Message>) => {
        ports[role].onmessage = onmessage;
        r(e.data as any);
      })
  );
}

function close(channel: Close) {}

export { init, send, recv, close };
