/**
 * `explicit-concrete` — write the type out instead of deriving it.
 *
 * A ready-made plugin banning every way of leaving a type implicit: utility
 * types, `keyof`, `typeof`, mapped types, index signatures, conditional types,
 * and assertions. Named functions must declare a return type.
 *
 * ```jsonc
 * // deno.json
 * {
 *   "lint": {
 *     "plugins": ["jsr:@cunarist/deno-lint-plugin-explicit-types/concrete"]
 *   }
 * }
 * ```
 *
 * @module
 */

import { noConditionalTypes } from "./no-conditional-types.ts";
import { noIndexSignatures } from "./no-index-signatures.ts";
import { noKeyof } from "./no-keyof.ts";
import { noMappedTypes } from "./no-mapped-types.ts";
import { noTypeAssertion } from "./no-type-assertion.ts";
import { noTypeofType } from "./no-typeof-type.ts";
import { noUtilityTypes } from "./no-utility-types.ts";
import { requireReturnType } from "./require-return-type.ts";

/**
 * The `explicit-concrete` rules, for composing your own plugin.
 *
 * Built from pairs rather than written as an object literal: a rule record is
 * a lookup keyed by rule id, so the ids belong in value position. This is
 * `camel-case-object-keys` applied to itself.
 */
export const concreteRules: Deno.lint.Plugin["rules"] = Object.fromEntries([
  ["no-utility-types", noUtilityTypes],
  ["no-keyof", noKeyof],
  ["no-typeof-type", noTypeofType],
  ["no-mapped-types", noMappedTypes],
  ["no-index-signatures", noIndexSignatures],
  ["no-conditional-types", noConditionalTypes],
  ["require-return-type", requireReturnType],
  ["no-type-assertion", noTypeAssertion],
]);

/** The `explicit-concrete` plugin, ready to list in `deno.json` `lint.plugins`. */
const plugin: Deno.lint.Plugin = {
  name: "explicit-concrete",
  rules: concreteRules,
};

// Individual rules, re-exported for composition.
export { noConditionalTypes } from "./no-conditional-types.ts";
export { noIndexSignatures } from "./no-index-signatures.ts";
export { noKeyof } from "./no-keyof.ts";
export { noMappedTypes } from "./no-mapped-types.ts";
export { noTypeAssertion } from "./no-type-assertion.ts";
export { noTypeofType } from "./no-typeof-type.ts";
export { noUtilityTypes } from "./no-utility-types.ts";
export { requireReturnType } from "./require-return-type.ts";

export default plugin;
