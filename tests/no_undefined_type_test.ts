import { noUndefinedType } from "#absence";

import {
  assertInvalid,
  assertReportedText,
  assertValid,
  rulePlugin,
} from "./harness.ts";

const plugin = rulePlugin("no-undefined-type", noUndefinedType);

Deno.test("no-undefined-type: allows null for absence", () => {
  assertValid(plugin, "function f(): Note | null { return null; }");
  assertValid(plugin, "const v: string | null = null;");
  assertValid(plugin, "interface A { cursor: string | null }");
});

Deno.test("no-undefined-type: allows the optional marker instead", () => {
  assertValid(plugin, "function f(a?: number): void {}");
  assertValid(plugin, "type Fn = (cb?: Element) => void;");
  assertValid(plugin, "interface A { m(a?: number): void }");
});

Deno.test("no-undefined-type: rejects undefined in a return type", () => {
  assertInvalid(plugin, "function f(): Note | undefined {}");
  assertInvalid(plugin, "const f = function (): Note | undefined {};");
  assertInvalid(plugin, "declare function f(): undefined;");
  assertInvalid(plugin, "interface A { m(): string | undefined }");
});

Deno.test("no-undefined-type: rejects undefined on values and members", () => {
  assertInvalid(plugin, "const v: string | undefined = undefined;");
  assertInvalid(plugin, "let w: undefined;");
  assertInvalid(plugin, "interface A { a: string | undefined }");
  assertInvalid(plugin, "type A = string | undefined;");
  assertInvalid(plugin, "class C { a: string | undefined = null; }");
});

Deno.test("no-undefined-type: rejects undefined on a parameter", () => {
  assertInvalid(plugin, "function f(a: string | undefined): void {}");
  assertInvalid(plugin, "const f = (a: string | undefined): void => {};");
  assertInvalid(plugin, "declare function f(a: string | undefined): void;");
  assertInvalid(plugin, "interface A { m(a: string | undefined): void }");
  assertInvalid(plugin, "class C { m(a: string | undefined): void {} }");
});

Deno.test("no-undefined-type: rejects undefined on a nested callback parameter", () => {
  assertInvalid(plugin, "type Fn = (cb: Element | undefined) => void;");
  assertInvalid(
    plugin,
    "function f(cb: (a: number | undefined) => void): void {}",
  );
});

Deno.test("no-undefined-type: rejects undefined on defaulted and parameter properties", () => {
  assertInvalid(plugin, 'function f(a: string | undefined = "x"): void {}');
  assertInvalid(
    plugin,
    "class C { constructor(private a: string | undefined) {} }",
  );
});

Deno.test("no-undefined-type: rejects undefined nested in a type argument", () => {
  assertInvalid(plugin, "function f(xs: Array<string | undefined>): void {}");
  assertInvalid(plugin, "function f(): Map<string, string | undefined> {}");
});

Deno.test("no-undefined-type: leaves void alone", () => {
  assertValid(plugin, "function f(): void {}");
});

Deno.test("no-undefined-type: fires once per keyword", () => {
  assertInvalid(plugin, "type A = undefined | (string | undefined);", 2);
});

Deno.test("no-undefined-type: highlights the keyword", () => {
  const code = "type A = string | undefined;";
  const [diagnostic] = assertInvalid(plugin, code);
  if (!diagnostic) throw new Error("expected a diagnostic");
  assertReportedText(code, diagnostic, "undefined");
});
