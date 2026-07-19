import { noMappedTypes } from "#concrete";

import {
  assertInvalid,
  assertReportedText,
  assertValid,
  rulePlugin,
} from "./harness.ts";

const plugin = rulePlugin("no-mapped-types", noMappedTypes);

Deno.test("no-mapped-types: allows concrete fields and a Map", () => {
  assertValid(plugin, "interface A { darkMode: boolean }");
  assertValid(plugin, "type A = { darkMode: boolean };");
  assertValid(plugin, "const m = new Map<string, boolean>();");
});

Deno.test("no-mapped-types: ignores index signatures", () => {
  assertValid(plugin, "interface A { [k: string]: number }");
});

Deno.test("no-mapped-types: rejects a plain mapped type", () => {
  assertInvalid(plugin, "type A = { [K in B]: boolean };");
});

Deno.test("no-mapped-types: rejects every modifier variant", () => {
  assertInvalid(plugin, "type A = { [K in B]?: boolean };");
  assertInvalid(plugin, "type A = { [K in B]-?: boolean };");
  assertInvalid(plugin, "type A = { readonly [K in B]: boolean };");
  assertInvalid(plugin, "type A = { -readonly [K in B]: boolean };");
});

Deno.test("no-mapped-types: rejects a renaming as clause", () => {
  assertInvalid(plugin, "type A = { [K in B as `on${K}`]: boolean };");
});

Deno.test("no-mapped-types: fires once per mapped type", () => {
  assertInvalid(plugin, "type A = { [K in B]: { [J in C]: boolean } };", 2);
});

Deno.test("no-mapped-types: highlights the whole construct", () => {
  const code = "type A = { [K in B]: boolean };";
  const [diagnostic] = assertInvalid(plugin, code);
  if (!diagnostic) throw new Error("expected a diagnostic");
  assertReportedText(code, diagnostic, "{ [K in B]: boolean }");
});
