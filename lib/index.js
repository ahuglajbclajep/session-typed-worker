function send(port, value) {
    port.postMessage(value);
    return port;
}
function recv(port) {
    return new Promise(function (resolve) {
        return (port.onmessage = function (e) {
            return resolve([e.data, port]);
        });
    });
}
function close(port) { }
export { send, recv, close };
