import { noIndexSignatures } from "#concrete";

import {
  assertInvalid,
  assertReportedText,
  assertValid,
  rulePlugin,
} from "./harness.ts";

const plugin = rulePlugin("no-index-signatures", noIndexSignatures);

Deno.test("no-index-signatures: allows concrete fields and a Map", () => {
  assertValid(plugin, "interface A { host: string; token: string }");
  assertValid(plugin, "const m = new Map<string, string>();");
});

Deno.test("no-index-signatures: ignores mapped types", () => {
  assertValid(plugin, "type A = { [K in B]: string };");
});

Deno.test("no-index-signatures: rejects the signature in each container", () => {
  assertInvalid(plugin, "interface A { [k: string]: string }");
  assertInvalid(plugin, "type A = { [k: string]: string };");
  assertInvalid(plugin, "class A { [k: string]: string; }");
});

Deno.test("no-index-signatures: rejects every key type", () => {
  assertInvalid(plugin, "interface A { [k: string]: number }");
  assertInvalid(plugin, "interface A { [k: number]: string }");
  assertInvalid(plugin, "interface A { [k: symbol]: string }");
});

Deno.test("no-index-signatures: rejects a readonly index signature once", () => {
  assertInvalid(plugin, "interface A { readonly [k: string]: string }");
});

Deno.test("no-index-signatures: highlights the signature member", () => {
  const code = "interface A { [key: string]: number }";
  const [diagnostic] = assertInvalid(plugin, code);
  if (!diagnostic) throw new Error("expected a diagnostic");
  assertReportedText(code, diagnostic, "[key: string]: number");
});
