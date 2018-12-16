# session-typed-worker

[![npm version](https://badge.fury.io/js/session-typed-worker.svg)](https://badge.fury.io/js/session-typed-worker)

> A deadlock-free communication API for web workers based on (a subset of) session types.

## Features

- Type-safe & deadlock-free
- Zero-dependency
- Integration with webpack

## Getting Started

### Install

Also install [worker-loader](https://github.com/webpack-contrib/worker-loader) for `importScripts()`.
You can use [worker-plugin](https://www.npmjs.com/package/worker-plugin) instead of worker-loader like [this](examples/worker-plugin/).

```sh
$ npm i -D worker-loader session-typed-worker
```

Then, set worker-loader's [Integrating with TypeScript](https://github.com/webpack-contrib/worker-loader/blob/master/README.md#integrating-with-typescript).
Probably it will be like this:

```ts
// typings/custom.d.ts
declare module "worker-loader!*" {
  class WebpackWorker extends Worker {
    constructor();
  }

  export = WebpackWorker;
}
```

### Writing a protocol

Write as a type a communication procedure and the kinds of values ​​to handle.
Sending from the main script to the worker is `C2W`, and the reverse is `W2C`.
The following `CheckNumbersEquality` protocol shows the operation of sending a numbers twice to the worker, receiving a boolean from the worker.

```ts
// protocols.d.ts
import { C2W, W2C, Fin } from "session-typed-worker";

type CheckNumbersEquality = C2W<number, C2W<number, W2C<boolean, Fin>>>;

export { CheckNumbersEquality };
```

### Writing code

The type representing communication on the main script side is taken out by giving `["client"]` to the protocol.

```ts
// index.ts
import { send, recv } from "session-typed-worker";
import * as proto from "./protocols";
import Worker = require("worker-loader!./worker");

const p: proto.CheckNumbersEquality["client"] = new Worker() as any;

(async () => {
  const p1 = send(p, 42);
  const p2 = send(p1, 42);
  const [v, _] = await recv(p2);
  console.log(v); // true
})();
```

Here the type of `p` is `Send<number, Send<number, Recv<boolean, Close>>>`.
(If you are using VSCode, you can check this with a mouseover.)
This type means that you first need to send a value of type `number` twice with `send` and then receive a value of type `boolean` with `recv`.
If you actually do `send` once, the type of the return value (i.e. `p1`) changes to `Send<number, Recv<boolean, Close>>`.
Even if you write `recv` instead of `send` or apply a value of type `string` instead of a value of type `number`, you can detect it by type checking.

In TypeScript, shadowing of local variables is not allowed.
Therefore, please note that it is necessary to change the variable name of the type value representing the communication operation like `p1` and `p2`.

Just like the main script side, the type representing communication on the worker side is taken out by giving `["worker"]` to the protocol.

```ts
// worker.ts
import { send, recv } from "session-typed-worker";
import * as proto from "./protocols";

const p: proto.CheckNumbersEquality["worker"] = self as any;

(async () => {
  const [v1, p1] = await recv(p);
  const [v2, p2] = await recv(p1);
  send(p2, v1 === v2);
})();
```

At this time, the type of `p` is `Recv<number, Recv<number, Send<boolean, Close>>>`, which is opposite to the type of `p` in the main script.
In other words, if you sending on one side, you can guarantee that the other side is sure to be receiving and you can write code that will not cause deadlock.

Complete examples including _tsconfig.json_ and _webpack.config.js_ are in the [examples directory](examples/).

## License

[MIT](LICENSE)
