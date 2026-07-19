import { requireReturnType } from "#concrete";

import {
  assertInvalid,
  assertReportedText,
  assertValid,
  rulePlugin,
} from "./harness.ts";

const plugin = rulePlugin("require-return-type", requireReturnType);

Deno.test("require-return-type: allows an annotated function", () => {
  assertValid(plugin, "function f(): number { return 1; }");
  assertValid(plugin, "const f = (): number => 1;");
  assertValid(plugin, "class C { m(): void {} }");
  assertValid(plugin, "interface I { m(): void }");
});

Deno.test("require-return-type: rejects a bare function declaration", () => {
  assertInvalid(plugin, "function f() { return 1; }");
});

Deno.test("require-return-type: rejects an assigned arrow or function expression", () => {
  assertInvalid(plugin, "const f = () => 1;");
  assertInvalid(plugin, "const f = function () { return 1; };");
});

Deno.test("require-return-type: exempts an inline callback", () => {
  assertValid(plugin, "items.map((item) => item.id);");
  assertValid(plugin, "run(function () { return 1; });");
  assertValid(plugin, "const handlers = [() => 1];");
  assertValid(plugin, "const o = { onClick: () => 1 };");
});

Deno.test("require-return-type: skips constructors and setters", () => {
  // TypeScript rejects a return type annotation on both.
  assertValid(plugin, "class C { constructor() {} }");
  assertValid(plugin, "class C { set s(v: number) {} }");
});

Deno.test("require-return-type: checks getters and methods", () => {
  assertInvalid(plugin, "class C { get g() { return 1; } }");
  assertInvalid(plugin, "class C { m() { return 1; } }");
});

Deno.test("require-return-type: checks interface method signatures", () => {
  assertInvalid(plugin, "interface I { m() }");
  assertValid(plugin, "interface I { m(): void }");
});

Deno.test("require-return-type: checks declared and overloaded functions", () => {
  assertInvalid(plugin, "declare function f();");
  assertValid(plugin, "declare function f(): void;");
});

Deno.test("require-return-type: checks async functions", () => {
  assertInvalid(plugin, "async function f() { return 1; }");
  assertValid(plugin, "async function f(): Promise<number> { return 1; }");
});

Deno.test("require-return-type: highlights the function name", () => {
  const code = "function loadConfig() { return 1; }";
  const [diagnostic] = assertInvalid(plugin, code);
  if (!diagnostic) throw new Error("expected a diagnostic");
  assertReportedText(code, diagnostic, "loadConfig");
});

Deno.test("require-return-type: highlights the key of a method signature", () => {
  const code = "interface I { m() }";
  const [diagnostic] = assertInvalid(plugin, code);
  if (!diagnostic) throw new Error("expected a diagnostic");
  assertReportedText(code, diagnostic, "m");
});
