'use strict';

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }

  if (!value || !value.then) {
    value = Promise.resolve(value);
  }

  return then ? value.then(then) : value;
}

var recv = _async(function (port, role) {
  var queues = port.queues,
      ports = port.ports;

  if (0 < queues[role].length) {
    var _queues$role$shift = queues[role].shift(),
        _queues$role$shift2 = _slicedToArray(_queues$role$shift, 2),
        label = _queues$role$shift2[0],
        value = _queues$role$shift2[1];

    return [label, [value, port]];
  }

  var onmessage = ports[role].onmessage;
  return new Promise(function (resolve) {
    return ports[role].onmessage = function (e) {
      ports[role].onmessage = onmessage;

      var _e$data = _slicedToArray(e.data, 2),
          label = _e$data[0],
          value = _e$data[1];

      resolve([label, [value, port]]);
    };
  });
});

function _invoke(body, then) {
  var result = body();

  if (result && result.then) {
    return result.then(then);
  }

  return then(result);
}

var init = _async(function (selfOrWorkers) {
  var _exit = false;
  var ports;
  return _invoke(function () {
    if (selfOrWorkers === self) {
      if (self.document) throw Error("The window is passed directly to the init function.");
      return _await(new Promise(function (resolve) {
        return selfOrWorkers.onmessage = function (e) {
          return resolve(e.data);
        };
      }), function (_Promise) {
        ports = _Promise;
      });
    } else {
      var workers = selfOrWorkers;
      var selves = Object.entries(workers).filter(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            w = _ref2[1];

        return w === self;
      });
      if (selves.length !== 1) throw Error("Only one self can be passed to the init function.");
      var roleOfSelf = selves[0][0];
      var portMap = Object.fromEntries(Object.keys(workers).map(function (r) {
        return [r, {}];
      }));

      for (var _i2 = 0, _Object$keys = Object.keys(workers); _i2 < _Object$keys.length; _i2++) {
        var k = _Object$keys[_i2];

        for (var _i3 = 0, _Object$keys2 = Object.keys(workers); _i3 < _Object$keys2.length; _i3++) {
          var l = _Object$keys2[_i3];
          if (k === l) return;

          if (!portMap[k][l]) {
            var _MessageChannel = new MessageChannel(),
                port1 = _MessageChannel.port1,
                port2 = _MessageChannel.port2;

            portMap[k][l] = port1;
            portMap[l][k] = port2;
          }
        }
      }

      Object.entries(workers).filter(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            w = _ref4[1];

        return w !== self;
      }).forEach(function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
            r = _ref6[0],
            w = _ref6[1];

        return w.postMessage(portMap[r], Object.values(portMap[r]));
      });
      ports = portMap[roleOfSelf];
    }
  }, function (_result) {
    if (_exit) return _result;
    var queues = Object.fromEntries(Object.keys(ports).map(function (r) {
      return [r, []];
    }));
    var context = {
      ports: ports,
      queues: queues
    };
    Object.entries(ports).forEach(function (_ref7) {
      var _ref8 = _slicedToArray(_ref7, 2),
          r = _ref8[0],
          p = _ref8[1];

      return p.onmessage = function (e) {
        return context.queues[r].push(e.data);
      };
    });
    return context;
  });
});

function _async(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }

    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}

Object.defineProperty(exports, '__esModule', {
  value: true
});

function send(port, role, label, value) {
  port.ports[role].postMessage([label, value]);
  return port;
}

function close(channel) {}

exports.close = close;
exports.init = init;
exports.recv = recv;
exports.send = send;
