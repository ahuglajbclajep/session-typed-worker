async function init(selfOrWorkers) {
  let ports;

  if (selfOrWorkers === globalThis) {
    if (globalThis.document) throw Error("The window is passed directly to the init function.");
    ports = await new Promise(resolve => selfOrWorkers.onmessage = e => resolve(e.data));
  } else {
    const workers = selfOrWorkers;
    const selves = Object.entries(workers).filter(([, w]) => w === self);
    if (selves.length !== 1) throw Error("Only one self can be passed to the init function.");
    const roleOfSelf = selves[0][0];
    let portMap = Object.fromEntries(Object.keys(workers).map(r => [r, {}]));

    for (const k of Object.keys(workers)) {
      for (const l of Object.keys(workers)) {
        if (k === l) continue;

        if (!portMap[k][l]) {
          const {
            port1,
            port2
          } = new MessageChannel();
          portMap[k][l] = port1;
          portMap[l][k] = port2;
        }
      }
    }

    Object.entries(workers).filter(([, w]) => w !== self).forEach(([r, w]) => w.postMessage(portMap[r], Object.values(portMap[r])));
    ports = portMap[roleOfSelf];
  }

  const queues = Object.fromEntries(Object.keys(ports).map(r => [r, []]));
  const context = {
    ports,
    queues
  };
  Object.entries(ports).forEach(([r, p]) => p.onmessage = e => context.queues[r].push(e.data));
  return context;
}

function send(channel, role, label, value) {
  channel.ports[role].postMessage([label, value]);
  return channel;
}

async function recv(channel, role) {
  const {
    queues,
    ports
  } = channel;

  if (0 < queues[role].length) {
    const [label, value] = queues[role].shift();
    return [label, [value, channel]];
  }

  const onmessage = ports[role].onmessage;
  return new Promise(resolve => ports[role].onmessage = e => {
    ports[role].onmessage = onmessage;
    const [label, value] = e.data;
    resolve([label, [value, channel]]);
  });
}

function close(channel) {}

export { close, init, recv, send };
