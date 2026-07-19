import { noKeyof } from "#concrete";

import {
  assertInvalid,
  assertReportedText,
  assertValid,
  rulePlugin,
} from "./harness.ts";

const plugin = rulePlugin("no-keyof", noKeyof);

Deno.test("no-keyof: allows a written-out key union", () => {
  assertValid(plugin, 'type A = "TITLE" | "AUTHOR";');
  assertValid(plugin, "function f(field: string): void {}");
});

Deno.test("no-keyof: ignores the readonly operator", () => {
  assertValid(plugin, "type A = readonly string[];");
  assertValid(plugin, "function f(xs: readonly number[]): void {}");
});

Deno.test("no-keyof: rejects keyof in every type position", () => {
  assertInvalid(plugin, "type A = keyof B;");
  assertInvalid(plugin, "function f(k: keyof A): void {}");
  assertInvalid(plugin, "function f(): keyof A {}");
  assertInvalid(plugin, "interface A { field: keyof B }");
  assertInvalid(plugin, "function f<T extends keyof A>(): void {}");
});

Deno.test("no-keyof: rejects keyof inside a mapped type constraint", () => {
  assertInvalid(plugin, "type A = { [K in keyof B]: string };");
});

Deno.test("no-keyof: fires once per keyof operator", () => {
  assertInvalid(plugin, "type A = keyof B | keyof C;", 2);
});

Deno.test("no-keyof: highlights the whole keyof operator", () => {
  const code = "type A = keyof Article;";
  const [diagnostic] = assertInvalid(plugin, code);
  if (!diagnostic) throw new Error("expected a diagnostic");
  assertReportedText(code, diagnostic, "keyof Article");
});
