import { To, Finish } from "../../../";

type Roles = "M" | "W";
type Fin = Finish<Roles>;
type CheckNumbersEquality = To<
  Roles,
  "M",
  "W",
  {
    _: [
      number,
      To<
        Roles,
        "M",
        "W",
        { _: [number, To<Roles, "W", "M", { _: [boolean, Fin] }>] }
      >
    ];
  }
>;

export { CheckNumbersEquality };
