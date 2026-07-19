import { upperSnakeStringUnions } from "#naming";

import {
  assertInvalid,
  assertReportedText,
  assertValid,
  rulePlugin,
} from "./harness.ts";

const plugin = rulePlugin("upper-snake-string-unions", upperSnakeStringUnions);

Deno.test("upper-snake-string-unions: allows UPPER_SNAKE_CASE members", () => {
  assertValid(plugin, 'type Status = "PENDING" | "IN_PROGRESS" | "DONE";');
  assertValid(plugin, 'type Mode = "FAST";');
});

Deno.test("upper-snake-string-unions: allows digits inside a segment", () => {
  assertValid(plugin, 'type Protocol = "HTTP2" | "LEVEL_3" | "H2C";');
});

Deno.test("upper-snake-string-unions: ignores non-string union members", () => {
  assertValid(plugin, 'type Id = "USER_ID" | number;');
  assertValid(plugin, "type Maybe = string | null;");
  assertValid(plugin, "type Union = Foo | Bar;");
  assertValid(plugin, 'type Mixed = "OPEN" | 42 | { id: string };');
});

Deno.test("upper-snake-string-unions: checks unions outside a type alias", () => {
  // A union written inline on an interface member is the same enumeration as
  // one behind an alias, so it is held to the same casing.
  assertInvalid(plugin, 'interface Box { mode: "fast" | "slow" }', 2);
  assertInvalid(plugin, 'function go(mode: "fast" | "slow") {}', 2);
  assertInvalid(plugin, 'const mode: "fast" | "slow" = "fast";', 2);
  assertValid(plugin, 'interface Box { mode: "FAST" | "SLOW" }');
});

Deno.test("upper-snake-string-unions: rejects lowercase and mixed-case members", () => {
  assertInvalid(plugin, 'type Status = "pending" | "PENDING";');
  assertInvalid(plugin, 'type Status = "Done" | "OPEN";');
  assertInvalid(plugin, 'type Status = "inProgress" | "OPEN";');
});

Deno.test("upper-snake-string-unions: rejects a member containing a space", () => {
  assertInvalid(plugin, 'type Status = "IN PROGRESS" | "DONE";');
});

Deno.test("upper-snake-string-unions: rejects malformed underscore segments", () => {
  assertInvalid(plugin, 'type Status = "_OPEN" | "DONE";');
  assertInvalid(plugin, 'type Status = "OPEN_" | "DONE";');
  assertInvalid(plugin, 'type Status = "OPEN__DONE" | "DONE";');
});

Deno.test("upper-snake-string-unions: reports once per offending member", () => {
  assertInvalid(plugin, 'type Status = "pending" | "done" | "OPEN";', 2);
});

Deno.test("upper-snake-string-unions: highlights the offending literal only", () => {
  const code = 'type Status = "OPEN" | "in progress" | "DONE";';
  const [diagnostic] = assertInvalid(plugin, code);
  if (!diagnostic) throw new Error("expected a diagnostic");
  assertReportedText(code, diagnostic, '"in progress"');
});
