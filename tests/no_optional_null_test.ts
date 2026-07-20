import { noOptionalNull } from "#absence";

import {
  assertInvalid,
  assertReportedText,
  assertValid,
  rulePlugin,
} from "./harness.ts";

const plugin = rulePlugin("no-optional-null", noOptionalNull);

Deno.test("no-optional-null: allows one spelling of absence", () => {
  assertValid(plugin, "function f(a?: string): void {}");
  assertValid(plugin, "function f(a: string | null): void {}");
});

Deno.test("no-optional-null: allows a default value alongside null", () => {
  assertValid(plugin, "function f(a: string | null = null): void {}");
});

Deno.test("no-optional-null: rejects an optional parameter unioned with null", () => {
  assertInvalid(plugin, "function f(a?: string | null): void {}");
  assertInvalid(plugin, "const f = (a?: string | null): void => {};");
  assertInvalid(plugin, "declare function f(a?: string | null): void;");
});

Deno.test("no-optional-null: rejects it on function types and method signatures", () => {
  assertInvalid(plugin, "type Fn = (a?: Element | null) => void;");
  assertInvalid(plugin, "interface A { m(a?: string | null): void }");
  assertInvalid(plugin, "class C { m(a?: string | null): void {} }");
});

Deno.test("no-optional-null: rejects a bare optional null", () => {
  assertInvalid(plugin, "function f(a?: null): void {}");
});

Deno.test("no-optional-null: rejects it on members too", () => {
  assertInvalid(plugin, "interface A { m?: string | null }");
  assertInvalid(plugin, "type A = { m?: string | null };");
  assertInvalid(plugin, "class C { a?: string | null; }");
});

Deno.test("no-optional-null: allows a member with one spelling", () => {
  assertValid(plugin, "interface A { m: string | null }");
  assertValid(plugin, "interface A { m?: string }");
});

Deno.test("no-optional-null: ignores null outside an optional binding", () => {
  assertValid(plugin, "function f(): string | null { return null; }");
  assertValid(plugin, "const v: string | null = null;");
  assertValid(plugin, "interface A { a: string | null }");
});

Deno.test("no-optional-null: names the binding", () => {
  for (
    const code of [
      "function f(path?: string | null): void {}",
      "interface A { path?: string | null }",
    ]
  ) {
    const [diagnostic] = assertInvalid(plugin, code);
    if (!diagnostic) throw new Error("expected a diagnostic");
    if (!diagnostic.message.includes("path")) {
      throw new Error(`message did not name it: ${diagnostic.message}`);
    }
  }
});

Deno.test("no-optional-null: highlights the null keyword", () => {
  const code = "function f(a?: string | null): void {}";
  const [diagnostic] = assertInvalid(plugin, code);
  if (!diagnostic) throw new Error("expected a diagnostic");
  assertReportedText(code, diagnostic, "null");
});
