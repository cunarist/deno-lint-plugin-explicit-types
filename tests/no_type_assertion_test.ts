import { noTypeAssertion } from "#concrete";

import {
  assertInvalid,
  assertReportedText,
  assertValid,
  rulePlugin,
} from "./harness.ts";

const plugin = rulePlugin("no-type-assertion", noTypeAssertion);

Deno.test("no-type-assertion: allows narrowing and annotations", () => {
  assertValid(plugin, "const el: HTMLInputElement | null = null;");
  assertValid(plugin, 'if (typeof x === "string") { use(x); }');
  assertValid(plugin, "if (node instanceof HTMLElement) { use(node); }");
});

Deno.test("no-type-assertion: allows as const", () => {
  assertValid(plugin, 'const modes = ["READ", "WRITE"] as const;');
  assertValid(plugin, 'const config = { host: "a" } as const;');
  assertValid(plugin, 'const a = "READ" as const;');
});

Deno.test("no-type-assertion: ignores non-null assertions", () => {
  assertValid(plugin, "const a = value!;");
});

Deno.test("no-type-assertion: rejects an as assertion", () => {
  assertInvalid(plugin, "const el = node as HTMLInputElement;");
  assertInvalid(plugin, "call(value as string);");
  assertInvalid(plugin, "function f(): void { return x as void; }");
});

Deno.test("no-type-assertion: rejects the angle-bracket form", () => {
  assertInvalid(plugin, "const n = <number> input;");
  assertInvalid(plugin, "const s = <HTMLElement> node;");
});

Deno.test("no-type-assertion: rejects an assertion to a type named Const", () => {
  assertInvalid(plugin, "const a = value as Const;");
});

Deno.test("no-type-assertion: reports each link of a double assertion", () => {
  assertInvalid(plugin, "const a = value as unknown as Target;", 2);
});

Deno.test("no-type-assertion: highlights the whole as expression", () => {
  const code = "const el = node as HTMLInputElement;";
  const [diagnostic] = assertInvalid(plugin, code);
  if (!diagnostic) throw new Error("expected a diagnostic");
  assertReportedText(code, diagnostic, "node as HTMLInputElement");
});

Deno.test("no-type-assertion: highlights the whole angle-bracket expression", () => {
  const code = "const n = <number> input;";
  const [diagnostic] = assertInvalid(plugin, code);
  if (!diagnostic) throw new Error("expected a diagnostic");
  assertReportedText(code, diagnostic, "<number> input");
});
