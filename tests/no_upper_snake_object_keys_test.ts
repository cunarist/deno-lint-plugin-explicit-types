import { noUpperSnakeObjectKeys } from "#naming";

import {
  assertInvalid,
  assertReportedText,
  assertValid,
  rulePlugin,
} from "./harness.ts";

const plugin = rulePlugin("no-upper-snake-object-keys", noUpperSnakeObjectKeys);

Deno.test("no-upper-snake-object-keys: rejects a union-keyed lookup table", () => {
  assertInvalid(plugin, 'const a = { PENDING: "x", DONE: "y" };', 2);
  assertInvalid(
    plugin,
    "interface Labels { PENDING: string; DONE: string }",
    2,
  );
  assertInvalid(plugin, "type Labels = { IN_PROGRESS: string };");
});

Deno.test("no-upper-snake-object-keys: quoting is not an escape hatch", () => {
  assertInvalid(plugin, 'const a = { "PENDING": 1 };');
  assertInvalid(plugin, 'interface L { "DONE": string }');
});

Deno.test("no-upper-snake-object-keys: allows ordinary keys", () => {
  assertValid(plugin, "const a = { id: 1, userId: 2, http2Push: 3 };");
  assertValid(plugin, "interface Row { id: string; createdAt: number }");
});

Deno.test("no-upper-snake-object-keys: allows names someone else defined", () => {
  // The point of narrowing this rule: these are foreign vocabularies, not
  // lookup tables keyed by one of our own string unions.
  assertValid(plugin, 'const m = { "cl-zip-dialog": Dialog };');
  assertValid(plugin, 'const a = { "data-language": lang };');
  assertValid(plugin, 'const k = { "Mod-z": undo, "Mod-Z": redo };');
  assertValid(plugin, 'const h = { "Content-Type": "json" };');
  assertValid(plugin, 'const h = { "x-api-key": key };');
  assertValid(plugin, "const v = { TSIndexSignature: fn };");
  assertValid(plugin, "const c = { ToggleBold: cmd };");
  assertValid(plugin, "const p = { $anchor: a, $head: b };");
});

Deno.test("no-upper-snake-object-keys: leaves snake_case to the built-in camelcase rule", () => {
  assertValid(plugin, "const a = { user_id: 1 };");
  assertValid(plugin, 'const a = { "user_id": 1 };');
});

Deno.test("no-upper-snake-object-keys: ignores class members", () => {
  assertValid(plugin, "class C { static MAX_RETRIES = 5; }");
});

Deno.test("no-upper-snake-object-keys: ignores destructuring", () => {
  assertValid(plugin, "const { PENDING } = labels;");
});

Deno.test("no-upper-snake-object-keys: ignores computed keys", () => {
  assertValid(plugin, "const a = { [key]: 1 };");
});

Deno.test("no-upper-snake-object-keys: ignores numeric keys", () => {
  assertValid(plugin, 'const a = { 0: "a", 1: "b" };');
});

Deno.test("no-upper-snake-object-keys: checks shorthand and method shorthand", () => {
  assertInvalid(plugin, "const a = { PENDING };");
  assertInvalid(plugin, "const a = { DO_THING() {} };");
});

Deno.test("no-upper-snake-object-keys: highlights the key alone", () => {
  const code = 'const a = { PENDING: "x" };';
  const [diagnostic] = assertInvalid(plugin, code);
  if (!diagnostic) throw new Error("expected a diagnostic");
  assertReportedText(code, diagnostic, "PENDING");
});
