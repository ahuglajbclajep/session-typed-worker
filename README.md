# session-typed-worker

> A deadlock-free communication API for web workers based on (a subset of) session types.

## Features

- Type-safe & deadlock-free  
  You can also get the type of the received value by inference.

- Only two simple, synchronous APIs  
  They do not even output objects for typing.
- Zero-dependency
- Integration with webpack

## Getting Started

### Install

Also install [worker-loader](https://github.com/webpack-contrib/worker-loader) for `importScripts()`.

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
The following `Number2String` protocol shows the operation of sending a number to the worker, receiving a string from the worker.

```ts
// protocols.d.ts
import { C2W, W2C, Fin } from "session-typed-worker";

type Number2String = C2W<number, W2C<string, Fin>>;

export { Number2String };
```

### Writing code

The type representing communication on the main script side is taken out by giving `["client"]` to the protocol.
Here the type of `p` is `Send<number, Recv<string, Close>>`.
(If you are using VSCode, you can check this with a mouseover.)
This type means that you first need to send a `numer` type value with `send` and then receive a `string` type value in `recv`.
If you actually do `send`, the type of the return value changes to `Recv<string, Close>`.

In TypeScript, shadowing of local variables is not allowed.
Therefore, please note that it is necessary to change the variable name of the type value representing the communication operation like `p1` and `p2`.

```ts
// index.ts
import { send, recv } from "session-typed-worker";
import * as protocol from "./protocols";
import Worker = require("worker-loader!./worker");

const p: protocol.Number2String["client"] = new Worker() as any;

(async () => {
  const p1 = send(p, 42);
  const [v, p2] = await recv(p1);
  console.log(v, typeof v); // 42 string
})();
```

Even if you write `recv` instead of `send` or write `boolean` instead of `number`, you can detect it by typing.

Just like the main script side, the type representing communication on the worker side is taken out by giving `["worker"]` to the protocol.

```ts
// worker.ts
import { send, recv } from "session-typed-worker";
import * as protocol from "./protocols";

const p: protocol.Number2String["worker"] = self as any;

(async () => {
  const [v, p1] = await recv(p);
  send(p1, v.toString(10));
})();
```

At this time, the type of `p` is `Recv<number, Send<string, Close>>`, which is opposite to the type of `p` in the main script.
In other words, if you sending on one side, you can guarantee that the other side is sure to be receiving and you can write code that will not cause deadlock.

Complete examples including _tsconfig.json_ and _webpack.config.js_ are in the [examples branch](https://github.com/ahuglajbclajep/session-typed-worker/tree/examples).

# License

[MIT](LICENSE)
