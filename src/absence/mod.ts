/**
 * `explicit-absence` — one spelling for an absent value.
 *
 * `?` is the undefined type, so this plugin keeps the keyword itself out of
 * type positions rather than mixing the two forms, and stops a `?` binding from
 * also admitting `null`. A member or parameter says absence with `?`; a return
 * type or variable, which cannot take `?`, says it with `| null`.
 *
 * ```jsonc
 * // deno.json
 * {
 *   "lint": {
 *     "plugins": ["jsr:@cunarist/deno-lint-plugin-explicit-types/absence"]
 *   }
 * }
 * ```
 *
 * @module
 */

import { noOptionalNull } from "./no-optional-null.ts";
import { noUndefinedType } from "./no-undefined-type.ts";

/**
 * The `explicit-absence` rules, for composing your own plugin.
 *
 * Built from pairs rather than written as an object literal: a rule record is
 * a lookup keyed by rule id, so the ids belong in value position. This is
 * `no-upper-snake-object-keys` applied to itself.
 */
export const absenceRules: Deno.lint.Plugin["rules"] = Object.fromEntries([
  ["no-undefined-type", noUndefinedType],
  ["no-optional-null", noOptionalNull],
]);

/** The `explicit-absence` plugin, ready to list in `deno.json` `lint.plugins`. */
const plugin: Deno.lint.Plugin = {
  name: "explicit-absence",
  rules: absenceRules,
};

// Individual rules, re-exported for composition.
export { noOptionalNull } from "./no-optional-null.ts";
export { noUndefinedType } from "./no-undefined-type.ts";

export default plugin;
