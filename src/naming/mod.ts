/**
 * `explicit-naming` — names carry the contract.
 *
 * A ready-made plugin requiring PascalCase type names, UPPER_SNAKE_CASE string
 * union members, camelCase object keys, and no `enum`.
 *
 * ```jsonc
 * // deno.json
 * {
 *   "lint": {
 *     "plugins": ["jsr:@cunarist/deno-lint-plugin-explicit-types/naming"]
 *   }
 * }
 * ```
 *
 * @module
 */

import { camelCaseObjectKeys } from "./camel-case-object-keys.ts";
import { noEnum } from "./no-enum.ts";
import { pascalCaseTypes } from "./pascal-case-types.ts";
import { upperSnakeStringUnions } from "./upper-snake-string-unions.ts";

/**
 * The `explicit-naming` rules, for composing your own plugin.
 *
 * Built from pairs rather than written as an object literal: a rule record is
 * a lookup keyed by rule id, so the ids belong in value position. This is
 * `camel-case-object-keys` applied to itself.
 */
export const namingRules: Deno.lint.Plugin["rules"] = Object.fromEntries([
  ["pascal-case-types", pascalCaseTypes],
  ["upper-snake-string-unions", upperSnakeStringUnions],
  ["camel-case-object-keys", camelCaseObjectKeys],
  ["no-enum", noEnum],
]);

/** The `explicit-naming` plugin, ready to list in `deno.json` `lint.plugins`. */
const plugin: Deno.lint.Plugin = {
  name: "explicit-naming",
  rules: namingRules,
};

// Individual rules, re-exported for composition.
export { camelCaseObjectKeys } from "./camel-case-object-keys.ts";
export { noEnum } from "./no-enum.ts";
export { pascalCaseTypes } from "./pascal-case-types.ts";
export { upperSnakeStringUnions } from "./upper-snake-string-unions.ts";

export default plugin;
