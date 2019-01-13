import unified from "unified";
import parse from "remark-parse";
import mutate from "remark-rehype";
import highlight from "rehype-highlight";
import stringify from "rehype-stringify";
import { send, recv } from "session-typed-worker";
import * as proto from "./protocols";

function md2html(markdown: string): string {
  return unified()
    .use(parse)
    .use(mutate)
    .use(highlight, { ignoreMissing: true })
    .use(stringify)
    .processSync(markdown)
    .toString();
}

const p: proto.Md2Html["worker"] = self as any;
(async () => {
  while (true) {
    const [markdown, p1] = await recv(p);
    send(p1, md2html(markdown));
  }
})();
