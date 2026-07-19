import { noTypeofType } from "#concrete";

import {
  assertInvalid,
  assertReportedText,
  assertValid,
  rulePlugin,
} from "./harness.ts";

const plugin = rulePlugin("no-typeof-type", noTypeofType);

Deno.test("no-typeof-type: allows the runtime typeof operator", () => {
  assertValid(plugin, 'if (typeof x === "string") { run(); }');
  assertValid(plugin, "const kind = typeof value;");
});

Deno.test("no-typeof-type: allows a named type", () => {
  assertValid(plugin, "function f(options: Options): void {}");
});

Deno.test("no-typeof-type: rejects typeof in every type position", () => {
  assertInvalid(plugin, "type A = typeof defaults;");
  assertInvalid(plugin, "function f(o: typeof defaults): void {}");
  assertInvalid(plugin, "function f(): typeof defaults {}");
  assertInvalid(plugin, "interface A { field: typeof defaults }");
});

Deno.test("no-typeof-type: rejects a typeof import query", () => {
  assertInvalid(plugin, 'type A = typeof import("./mod.ts");');
});

Deno.test("no-typeof-type: fires once inside keyof typeof", () => {
  assertInvalid(plugin, "type A = keyof typeof defaults;");
});

Deno.test("no-typeof-type: highlights the whole query", () => {
  const code = "type A = typeof defaults;";
  const [diagnostic] = assertInvalid(plugin, code);
  if (!diagnostic) throw new Error("expected a diagnostic");
  assertReportedText(code, diagnostic, "typeof defaults");
});
