import { To, Finish } from "../../../";

type Roles = "M" | "W";
type Fin = Finish<Roles>;
type CheckNumbersEquality = To<
  "M",
  "W",
  {
    _: [
      number,
      To<
        "M",
        "W",
        { _: [number, To<"W", "M", { _: [boolean, Fin] }, Roles>] },
        Roles
      >
    ];
  },
  Roles
>;

export { CheckNumbersEquality };
