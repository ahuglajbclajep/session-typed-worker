import { C2W, W2C, Fin } from "session-typed-worker";

type CheckNumbersEquality = C2W<number, C2W<number, W2C<boolean, Fin>>>;

export { CheckNumbersEquality };
