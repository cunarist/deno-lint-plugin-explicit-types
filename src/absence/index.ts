/**
 * `explicit-absence` — one spelling for an absent value.
 *
 * `?` is the undefined type, so this plugin keeps the keyword itself out of
 * type positions rather than mixing the two forms, and stops a `?` binding from
 * also admitting `null`. A member or parameter says absence with `?`; a return
 * type or variable, which cannot take `?`, says it with `| null`.
 *
 * @module
 */

import { eslintCompatPlugin, type Plugin } from "@oxlint/plugins";
import type { OxlintConfig } from "oxlint";

import { presetConfig } from "#helpers";

import { noOptionalNull } from "./no-optional-null.ts";
import { noUndefinedType } from "./no-undefined-type.ts";

/**
 * The `explicit-absence` rules, keyed by rule id.
 *
 * Built from pairs rather than written as an object literal: a rule record is
 * a lookup keyed by rule id, so the ids belong in value position. This is
 * `no-upper-snake-object-keys` applied to itself.
 */
export const absenceRules: Plugin["rules"] = Object.fromEntries([
  ["no-undefined-type", noUndefinedType],
  ["no-optional-null", noOptionalNull],
]);

/** The `explicit-absence` plugin, for Oxlint `jsPlugins` or ESLint `plugins`. */
const plugin: Plugin = eslintCompatPlugin({
  meta: { name: "explicit-absence" },
  rules: absenceRules,
});

/**
 * An Oxlint config that loads `explicit-absence` and turns every rule in it on, for
 * `lint.extends`. Override a rule after it to turn that one off.
 */
export const absenceConfig: OxlintConfig = presetConfig(
  "absence",
  "explicit-absence",
  absenceRules,
);

export { noOptionalNull, noUndefinedType };

export default plugin;
