"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function send(port, value) {
    port.postMessage(value);
    return port;
}
exports.send = send;
function recv(port) {
    return new Promise(function (resolve) { return (port.onmessage = function (e) { return resolve([e.data, port]); }); });
}
exports.recv = recv;
