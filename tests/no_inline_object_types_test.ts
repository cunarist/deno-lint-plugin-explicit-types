import { noInlineObjectTypes } from "#concrete";

import {
  assertInvalid,
  assertReportedText,
  assertValid,
  rulePlugin,
} from "./harness.ts";

const plugin = rulePlugin("no-inline-object-types", noInlineObjectTypes);

Deno.test("no-inline-object-types: allows a named interface", () => {
  assertValid(plugin, "interface Row { id: string }");
  assertValid(plugin, "function f(row: Row): void {}");
  assertValid(plugin, "type Alias = Row;");
  assertValid(plugin, "type Union = string | number;");
});

Deno.test("no-inline-object-types: rejects an inline parameter type", () => {
  assertInvalid(plugin, "function f(state: { a: string }): void {}");
});

Deno.test("no-inline-object-types: rejects an inline return type", () => {
  assertInvalid(
    plugin,
    "function f(): { ok: boolean } { return { ok: true }; }",
  );
});

Deno.test("no-inline-object-types: rejects a type alias to an object shape", () => {
  assertInvalid(plugin, "type A = { a: string };");
  assertInvalid(plugin, "type Empty = {};");
});

Deno.test("no-inline-object-types: rejects a nested shape", () => {
  assertInvalid(plugin, "interface I { nested: { deep: string } }");
});

Deno.test("no-inline-object-types: rejects a generic constraint", () => {
  assertInvalid(plugin, "function h<T extends { id: string }>(x: T): void {}");
});

Deno.test("no-inline-object-types: reports each variant of a discriminated union", () => {
  assertInvalid(
    plugin,
    'type Msg = { kind: "A"; a: string } | { kind: "B"; b: number };',
    2,
  );
});

Deno.test("no-inline-object-types: ignores object values", () => {
  assertValid(plugin, "const a = { x: 1 };");
  assertValid(plugin, "run({ x: 1 });");
});

Deno.test("no-inline-object-types: highlights the whole shape", () => {
  const code = "function f(state: { a: string }): void {}";
  const [diagnostic] = assertInvalid(plugin, code);
  if (!diagnostic) throw new Error("expected a diagnostic");
  assertReportedText(code, diagnostic, "{ a: string }");
});
