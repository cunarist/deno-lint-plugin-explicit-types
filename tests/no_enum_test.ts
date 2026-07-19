import { noEnum } from "#naming";

import {
  assertInvalid,
  assertReportedText,
  assertValid,
  rulePlugin,
} from "./harness.ts";

const plugin = rulePlugin("no-enum", noEnum);

Deno.test("no-enum: allows a string union standing in for an enum", () => {
  assertValid(plugin, 'type Status = "PENDING" | "DONE";');
  assertValid(plugin, 'const current: Status = "PENDING";');
});

Deno.test("no-enum: allows unrelated declarations", () => {
  assertValid(plugin, "class Status {}");
  assertValid(plugin, "interface Status { code: number }");
  assertValid(plugin, "const Status = { PENDING: 0 };");
});

Deno.test("no-enum: rejects a numeric enum", () => {
  assertInvalid(plugin, "enum Status { Pending, Done }");
});

Deno.test("no-enum: rejects a string enum", () => {
  assertInvalid(plugin, 'enum Status { Pending = "PENDING" }');
});

Deno.test("no-enum: rejects a heterogeneous enum", () => {
  assertInvalid(plugin, 'enum Mixed { A = 0, B = "B" }');
});

Deno.test("no-enum: rejects a const enum", () => {
  assertInvalid(plugin, "const enum Status { Pending, Done }");
});

Deno.test("no-enum: rejects a declared enum", () => {
  assertInvalid(plugin, "declare enum Status { Pending }");
});

Deno.test("no-enum: rejects an exported enum", () => {
  assertInvalid(plugin, "export enum Status { Pending, Done }");
  assertInvalid(plugin, "export const enum Flag { On }");
});

Deno.test("no-enum: reports once per enum regardless of member count", () => {
  assertInvalid(plugin, "enum Status { A, B, C, D, E }", 1);
});

Deno.test("no-enum: reports once per enum in a file with several", () => {
  assertInvalid(plugin, "enum A { X }\nenum B { Y }", 2);
});

Deno.test("no-enum: highlights the enum name only", () => {
  const code = "enum Status { Pending, Done }";
  const [diagnostic] = assertInvalid(plugin, code);
  if (!diagnostic) throw new Error("expected a diagnostic");
  assertReportedText(code, diagnostic, "Status");
});

Deno.test("no-enum: highlights the name of a const enum", () => {
  const code = "const enum Flag { On }";
  const [diagnostic] = assertInvalid(plugin, code);
  if (!diagnostic) throw new Error("expected a diagnostic");
  assertReportedText(code, diagnostic, "Flag");
});
