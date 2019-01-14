import "github-markdown-css/github-markdown.css";
import "highlight.js/styles/github.css";
import "./style.scss";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { send, recv } from "session-typed-worker";
import * as proto from "./protocols";

class App extends React.Component<{}, { html: string }> {
  private p: proto.Md2Html["client"] = new Worker("./worker.ts") as any;

  constructor(props: never) {
    super(props);
    this.state = { html: "" };
  }

  async handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const p1 = send(this.p, e.target.value);
    const [html] = await recv(p1);
    this.setState({ html });
  }

  render() {
    return (
      <div className="container">
        <textarea
          className="edit-area"
          onChange={this.handleChange.bind(this)}
          autoFocus
          placeholder="# mdpreview"
        />
        <div
          className="markdown-body"
          dangerouslySetInnerHTML={{ __html: this.state.html }}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
