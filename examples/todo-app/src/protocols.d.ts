import { CommBase, EndBase, Init } from "../../../";

type Roles = "main" | "remote" | "local";
type End = EndBase<Roles>;
type Comm<R1, R2, Conts> = CommBase<Roles, R1, R2, Conts>;

type Content = { createdAt: number; todo: string };
type Contents = Content[];

type G = Comm<
  "main",
  "remote",
  {
    push: [Contents, Comm<"remote", "local", { save: [Contents, End] }>];
    fetch: [
      "",
      Comm<
        "remote",
        "local",
        { _: [Contents, Comm<"local", "main", { latest: [Contents, End] }>] }
      >
    ];
  }
>;

export default G;
