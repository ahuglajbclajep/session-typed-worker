import { send, receive } from "./runtime";
import type { Select, Offer, Close } from "./mpst";

///////////////////////////// test cases of send /////////////////////////////

declare const s: Select<"A", { l: (k: number) => Close }>;

// @dts-jest:pass:snap Close
send<"A", { l: (k: number) => Close }, "l">(s, "A", "l", 42);

// @dts-jest:fail:snap Argument of type '"B"' is not assignable to parameter of type '"A"'.
send<"A", { l: (k: number) => Close }, "l">(s, "B", "l", 42);

// @dts-jest:fail:snap Type '"A"' is not assignable to type '"B"'.
send<"B", { l: (k: number) => Close }, "l">(s, "A", "l", 42);

// @dts-jest:fail:snap Argument of type '"r"' is not assignable to parameter of type '"l"'.
send<"A", { l: (k: number) => Close }, "l">(s, "A", "r", 42);

// @dts-jest:fail:snap Type '"r"' does not satisfy the constraint '"l"'.
send<"A", { l: (k: number) => Close }, "r">(s, "A", "l", 42);

// @dts-jest:fail:snap Property 'r' is missing in type '{ l: (k: number) => Close; }'.
send<"A", { r: (k: number) => Close }, "r">(s, "A", "l", 42);

// @dts-jest:fail:snap Argument of type 'string' is not assignable to parameter of type 'number'.
send<"A", { l: (k: number) => Close }, "l">(s, "A", "l", "42");

// @dts-jest:fail:snap Type 'string' is not assignable to type 'number'.
send<"A", { l: (k: string) => Close }, "l">(s, "A", "l", 42);

//////////////////////////// test cases of receive ////////////////////////////

declare const o: Offer<"B", ["l", [number, Close]]>;

// @dts-jest:pass:snap Promise<{ label: "l"; value: number; port: Close }>
receive<"B", ["l", [number, Close]]>(o, "B");

// @dts-jest:fail:snap Argument of type '"A"' is not assignable to parameter of type '"B"'.
receive<"B", ["l", [number, Close]]>(o, "A");

// @dts-jest:fail:snap Type '"B"' is not assignable to type '"A"'.
receive<"A", ["l", [number, Close]]>(o, "B");

// @dts-jest:fail:snap Type '"l"' is not assignable to type '"r"'.
receive<"B", ["r", [number, Close]]>(o, "B");

// @dts-jest:fail:snap Type 'number' is not assignable to type 'string'.
receive<"B", ["l", [string, Close]]>(o, "B");
