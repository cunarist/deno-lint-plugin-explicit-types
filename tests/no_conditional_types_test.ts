import { noConditionalTypes } from "#concrete";

import {
  assertInvalid,
  assertReportedText,
  assertValid,
  rulePlugin,
} from "./harness.ts";

const plugin = rulePlugin("no-conditional-types", noConditionalTypes);

Deno.test("no-conditional-types: allows a plain type alias", () => {
  assertValid(plugin, "type Items = TaskSnapshot;");
  assertValid(plugin, "type Wrapper<T> = { value: T };");
  assertValid(plugin, "type Union = string | number;");
});

Deno.test("no-conditional-types: rejects a conditional type", () => {
  assertInvalid(plugin, "type Flag<T> = T extends string ? 1 : 2;");
});

Deno.test("no-conditional-types: reports the conditional and the infer separately", () => {
  assertInvalid(plugin, "type U<T> = T extends Array<infer E> ? E : never;", 2);
});

Deno.test("no-conditional-types: reports each nested conditional", () => {
  assertInvalid(
    plugin,
    "type N<T> = T extends string ? 1 : T extends number ? 2 : 3;",
    2,
  );
});

Deno.test("no-conditional-types: fires in an annotation position too", () => {
  assertInvalid(plugin, "function f(): T extends string ? 1 : 2 { return x; }");
});

Deno.test("no-conditional-types: highlights the conditional type", () => {
  const code = "type Flag<T> = T extends string ? 1 : 2;";
  const [diagnostic] = assertInvalid(plugin, code);
  if (!diagnostic) throw new Error("expected a diagnostic");
  assertReportedText(code, diagnostic, "T extends string ? 1 : 2");
});

Deno.test("no-conditional-types: highlights the infer fragment", () => {
  const code = "type U<T> = T extends Array<infer E> ? E : never;";
  const diagnostics = assertInvalid(plugin, code, 2);
  const inferDiagnostic = diagnostics.find((d) => d.message.includes("infer"));
  if (!inferDiagnostic) throw new Error("expected an infer diagnostic");
  assertReportedText(code, inferDiagnostic, "infer E");
});
