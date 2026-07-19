import { camelCaseObjectKeys } from "#naming";

import {
  assertInvalid,
  assertReportedText,
  assertValid,
  rulePlugin,
} from "./harness.ts";

const plugin = rulePlugin("camel-case-object-keys", camelCaseObjectKeys);

Deno.test("camel-case-object-keys: allows camelCase keys", () => {
  assertValid(plugin, "const a = { id: 1, userId: 2, http2Push: 3 };");
  assertValid(plugin, "interface Row { id: string; userId: number; }");
  assertValid(plugin, "type Row = { id: string; createdAt: number };");
});

Deno.test("camel-case-object-keys: rejects an UPPER_SNAKE_CASE lookup table", () => {
  assertInvalid(plugin, 'const a = { PENDING: "x", DONE: "y" };', 2);
});

Deno.test("camel-case-object-keys: rejects a quoted non-camelCase key", () => {
  assertInvalid(plugin, 'const a = { "Content-Type": "json" };');
  assertInvalid(plugin, 'const a = { "user_id": 1 };');
});

Deno.test("camel-case-object-keys: quoting is not an escape hatch", () => {
  // Deno's built-in `camelcase` accepts any quoted key — its hint offers
  // quoting as the way to silence it. This rule reads the spelling instead,
  // so the same name fires whether or not it is quoted, in all three
  // positions.
  assertInvalid(plugin, 'const a = { "PENDING": 1, "DONE": 2 };', 2);
  assertInvalid(
    plugin,
    'interface Labels { "PENDING": string; "DONE": string }',
    2,
  );
  assertInvalid(plugin, 'type Labels = { "PENDING": string };');
});

Deno.test("camel-case-object-keys: allows a quoted camelCase key", () => {
  assertValid(plugin, 'const a = { "userId": 1 };');
  assertValid(plugin, 'interface Row { "userId": string }');
});

Deno.test("camel-case-object-keys: rejects a numeric key", () => {
  assertInvalid(plugin, 'const a = { 0: "a", 1: "b" };', 2);
});

Deno.test("camel-case-object-keys: rejects non-camelCase type members", () => {
  assertInvalid(plugin, "interface Labels { PENDING: string; }");
  assertInvalid(plugin, "type Labels = { DONE: string };");
  assertInvalid(plugin, 'interface Head { "Content-Type": string; }');
});

Deno.test("camel-case-object-keys: ignores class members", () => {
  assertValid(plugin, "class C { static MAX_RETRIES = 5; }");
  assertValid(plugin, "class C { PENDING = 1; }");
});

Deno.test("camel-case-object-keys: ignores destructuring", () => {
  assertValid(plugin, "const { user_id } = row;");
  assertValid(plugin, "function f({ user_id }) { return user_id; }");
});

Deno.test("camel-case-object-keys: ignores computed keys", () => {
  assertValid(plugin, "const a = { [key]: 1 };");
  assertValid(plugin, "const a = { [Symbol.iterator]: 1 };");
});

Deno.test("camel-case-object-keys: checks shorthand and method shorthand", () => {
  assertInvalid(plugin, "const a = { user_id };");
  assertInvalid(plugin, "const a = { my_method() {} };");
});

Deno.test("camel-case-object-keys: highlights the key alone", () => {
  const code = 'const a = { PENDING: "x" };';
  const [diagnostic] = assertInvalid(plugin, code);
  if (!diagnostic) throw new Error("expected a diagnostic");
  assertReportedText(code, diagnostic, "PENDING");
});

Deno.test("camel-case-object-keys: highlights a quoted key with its quotes", () => {
  const code = 'const a = { "Content-Type": 1 };';
  const [diagnostic] = assertInvalid(plugin, code);
  if (!diagnostic) throw new Error("expected a diagnostic");
  assertReportedText(code, diagnostic, '"Content-Type"');
});
