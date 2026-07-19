import { noUtilityTypes } from "#concrete";

import {
  assertInvalid,
  assertReportedText,
  assertValid,
  rulePlugin,
} from "./harness.ts";

const plugin = rulePlugin("no-utility-types", noUtilityTypes);

/** Every built-in utility type the rule rejects. */
const UTILITY_TYPE_NAMES: readonly string[] = [
  "Awaited",
  "Partial",
  "Required",
  "Readonly",
  "Record",
  "Pick",
  "Omit",
  "Exclude",
  "Extract",
  "NonNullable",
  "Parameters",
  "ConstructorParameters",
  "ReturnType",
  "InstanceType",
  "ThisParameterType",
  "OmitThisParameter",
  "ThisType",
  "NoInfer",
  "Uppercase",
  "Lowercase",
  "Capitalize",
  "Uncapitalize",
];

Deno.test("no-utility-types: allows ordinary type references", () => {
  assertValid(plugin, "type A = Article;");
  assertValid(plugin, "let m: Map<string, number>;");
  assertValid(plugin, "interface B { title: string }");
});

Deno.test("no-utility-types: rejects each of the 22 built-ins", () => {
  for (const name of UTILITY_TYPE_NAMES) {
    assertInvalid(plugin, `type A = ${name}<B>;`);
  }
});

Deno.test("no-utility-types: rejects a qualified reference by its tail", () => {
  assertInvalid(plugin, "type A = ns.Partial<B>;");
  assertInvalid(plugin, "type A = deep.ns.ReturnType<B>;");
});

Deno.test("no-utility-types: fires in every type position", () => {
  assertInvalid(plugin, "function f(x: Partial<A>): void {}");
  assertInvalid(plugin, "function f(): Omit<A, 'b'> {}");
  assertInvalid(plugin, "interface A { field: Record<string, number> }");
  assertInvalid(plugin, "let x: Map<string, Partial<A>>;");
});

Deno.test("no-utility-types: ignores values that share a utility name", () => {
  assertValid(plugin, "const Record = 1;");
  assertValid(plugin, "Partial(x);");
  assertValid(plugin, "const x = { Omit: 1 };");
});

Deno.test("no-utility-types: highlights the whole type reference", () => {
  const code = "type A = Partial<Article>;";
  const [diagnostic] = assertInvalid(plugin, code);
  if (!diagnostic) throw new Error("expected a diagnostic");
  assertReportedText(code, diagnostic, "Partial<Article>");
});

Deno.test("no-utility-types: names the utility in the message", () => {
  const [diagnostic] = assertInvalid(plugin, "type A = ReturnType<B>;");
  if (!diagnostic) throw new Error("expected a diagnostic");
  if (!diagnostic.message.includes("ReturnType")) {
    throw new Error(`message did not name the utility: ${diagnostic.message}`);
  }
});
