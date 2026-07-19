import { pascalCaseTypes } from "#naming";

import {
  assertInvalid,
  assertReportedText,
  assertValid,
  rulePlugin,
} from "./harness.ts";

const plugin = rulePlugin("pascal-case-types", pascalCaseTypes);

Deno.test("pascal-case-types: allows PascalCase declarations", () => {
  assertValid(plugin, "class DataStore {}");
  assertValid(plugin, "interface HttpResponse { status: number }");
  assertValid(plugin, "type UserProfile = { id: string };");
  assertValid(plugin, "enum Status { Pending }");
});

Deno.test("pascal-case-types: allows digits after the first letter", () => {
  assertValid(plugin, "class Base64Encoder {}");
  assertValid(plugin, "interface Http2Stream { id: number }");
});

Deno.test("pascal-case-types: skips anonymous class expressions", () => {
  assertValid(plugin, "const C = class {};");
  assertValid(plugin, "export default class {}");
});

Deno.test("pascal-case-types: rejects each declaration kind", () => {
  assertInvalid(plugin, "class dataStore {}");
  assertInvalid(plugin, "interface http_response { status: number }");
  assertInvalid(plugin, "type user_profile = { id: string };");
  assertInvalid(plugin, "enum status_code { Ok }");
});

Deno.test("pascal-case-types: rejects a named class expression", () => {
  assertInvalid(plugin, "const C = class my_class {};");
});

Deno.test("pascal-case-types: rejects underscores anywhere in the name", () => {
  assertInvalid(plugin, "class User_Profile {}");
  assertInvalid(plugin, "interface Http_Response { status: number }");
});

Deno.test("pascal-case-types: rejects a lowercase or digit first character", () => {
  assertInvalid(plugin, "class dataStore {}");
  assertInvalid(plugin, "type _Internal = { id: string };");
});

Deno.test("pascal-case-types: fires on an exported declaration", () => {
  assertInvalid(plugin, "export class data_store {}");
  assertInvalid(plugin, "export interface http_response { status: number }");
});

Deno.test("pascal-case-types: highlights the identifier only", () => {
  const code = "class data_store { run() {} }";
  const [diagnostic] = assertInvalid(plugin, code);
  if (!diagnostic) throw new Error("expected a diagnostic");
  assertReportedText(code, diagnostic, "data_store");
});

Deno.test("pascal-case-types: highlights an interface identifier only", () => {
  const code = "interface http_response { status: number }";
  const [diagnostic] = assertInvalid(plugin, code);
  if (!diagnostic) throw new Error("expected a diagnostic");
  assertReportedText(code, diagnostic, "http_response");
});
