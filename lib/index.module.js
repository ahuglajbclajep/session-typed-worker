async function init(threads) {
  let ports;

  if (!threads) {
    if (self.document) throw Error("cannot call the init function with no arguments in window.");
    ports = await new Promise(resolve => self.onmessage = e => resolve(e.data));
  } else {
    const selves = Object.entries(threads).filter(([, t]) => t === self);
    if (selves.length !== 1) throw Error("cannot pass more than one 'self' to the init function.");
    const roleOfSelf = selves[0][0];
    let portMap = Object.fromEntries(Object.keys(threads).map(r => [r, {}]));

    for (const r of Object.keys(threads)) {
      for (const s of Object.keys(threads)) {
        if (r === s) continue;

        if (!portMap[r][s]) {
          const {
            port1,
            port2
          } = new MessageChannel();
          portMap[r][s] = port1;
          portMap[s][r] = port2;
        }
      }
    }

    Object.entries(threads).filter(([, t]) => t !== self).forEach(([r, t]) => t.postMessage(portMap[r], Object.values(portMap[r])));
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

function send(port, role, label, value) {
  port.ports[role].postMessage([label, value]);
  return port;
}

async function receive(port, role) {
  const {
    queues,
    ports
  } = port;

  if (0 < queues[role].length) {
    const [label, value] = queues[role].shift();
    return {
      label,
      value,
      port
    };
  }

  const onmessage = ports[role].onmessage;
  return new Promise(resolve => ports[role].onmessage = e => {
    ports[role].onmessage = onmessage;
    const [label, value] = e.data;
    resolve({
      label,
      value,
      port
    });
  });
}

function close(port) {}

export { close, init, receive, send };
