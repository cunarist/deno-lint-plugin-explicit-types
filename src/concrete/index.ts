/**
 * `explicit-concrete` — write the type out instead of deriving it.
 *
 * Bans every way of leaving a type implicit: utility types, `keyof`, `typeof`,
 * mapped types, index signatures, conditional types, and assertions. Named
 * functions must declare a return type.
 *
 * @module
 */

import { eslintCompatPlugin, type Plugin } from "@oxlint/plugins";
import type { OxlintConfig } from "oxlint";

import { presetConfig } from "#helpers";

import { noConditionalTypes } from "./no-conditional-types.ts";
import { noIndexSignatures } from "./no-index-signatures.ts";
import { noInlineObjectTypes } from "./no-inline-object-types.ts";
import { noKeyof } from "./no-keyof.ts";
import { noMappedTypes } from "./no-mapped-types.ts";
import { noTypeAssertion } from "./no-type-assertion.ts";
import { noTypeofType } from "./no-typeof-type.ts";
import { noUtilityTypes } from "./no-utility-types.ts";
import { requireReturnType } from "./require-return-type.ts";

/**
 * The `explicit-concrete` rules, keyed by rule id.
 *
 * Built from pairs rather than written as an object literal: a rule record is
 * a lookup keyed by rule id, so the ids belong in value position. This is
 * `no-upper-snake-object-keys` applied to itself.
 */
export const concreteRules: Plugin["rules"] = Object.fromEntries([
  ["no-utility-types", noUtilityTypes],
  ["no-keyof", noKeyof],
  ["no-typeof-type", noTypeofType],
  ["no-mapped-types", noMappedTypes],
  ["no-index-signatures", noIndexSignatures],
  ["no-inline-object-types", noInlineObjectTypes],
  ["no-conditional-types", noConditionalTypes],
  ["require-return-type", requireReturnType],
  ["no-type-assertion", noTypeAssertion],
]);

/** The `explicit-concrete` plugin, for Oxlint `jsPlugins` or ESLint `plugins`. */
const plugin: Plugin = eslintCompatPlugin({
  meta: { name: "explicit-concrete" },
  rules: concreteRules,
});

/**
 * An Oxlint config that loads `explicit-concrete` and turns every rule in it on, for
 * `lint.extends`. Override a rule after it to turn that one off.
 */
export const concreteConfig: OxlintConfig = presetConfig(
  "concrete",
  "explicit-concrete",
  concreteRules,
);

export {
  noConditionalTypes,
  noIndexSignatures,
  noInlineObjectTypes,
  noKeyof,
  noMappedTypes,
  noTypeAssertion,
  noTypeofType,
  noUtilityTypes,
  requireReturnType,
};

export default plugin;
