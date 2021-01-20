import { CommBase, EndBase } from "../../../";

type Roles = "M" | "W";
type End = EndBase<Roles>;
type CheckNumbersEquality = CommBase<
  Roles,
  "M",
  "W",
  {
    _: [
      number,
      CommBase<
        Roles,
        "M",
        "W",
        { _: [number, CommBase<Roles, "W", "M", { _: [boolean, End] }>] }
      >
    ];
  }
>;

export { CheckNumbersEquality };
