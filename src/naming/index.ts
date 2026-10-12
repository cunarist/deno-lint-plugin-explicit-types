/**
 * `explicit-naming` — names carry the contract.
 *
 * Requires PascalCase type names and UPPER_SNAKE_CASE string union members,
 * keeps that casing out of object keys, and bans `enum`.
 *
 * @module
 */

import { eslintCompatPlugin, type Plugin } from "@oxlint/plugins";
import type { OxlintConfig } from "oxlint";

import { presetConfig } from "#helpers";

import { noEnum } from "./no-enum.ts";
import { noUpperSnakeObjectKeys } from "./no-upper-snake-object-keys.ts";
import { pascalCaseTypes } from "./pascal-case-types.ts";
import { upperSnakeStringUnions } from "./upper-snake-string-unions.ts";

/**
 * The `explicit-naming` rules, keyed by rule id.
 *
 * Built from pairs rather than written as an object literal: a rule record is
 * a lookup keyed by rule id, so the ids belong in value position. This is
 * `no-upper-snake-object-keys` applied to itself.
 */
export const namingRules: Plugin["rules"] = Object.fromEntries([
  ["pascal-case-types", pascalCaseTypes],
  ["upper-snake-string-unions", upperSnakeStringUnions],
  ["no-upper-snake-object-keys", noUpperSnakeObjectKeys],
  ["no-enum", noEnum],
]);

/** The `explicit-naming` plugin, for Oxlint `jsPlugins` or ESLint `plugins`. */
const plugin: Plugin = eslintCompatPlugin({
  meta: { name: "explicit-naming" },
  rules: namingRules,
});

/**
 * An Oxlint config that loads `explicit-naming` and turns every rule in it on, for
 * `lint.extends`. Override a rule after it to turn that one off.
 */
export const namingConfig: OxlintConfig = presetConfig("naming", "explicit-naming", namingRules);

export { noEnum, noUpperSnakeObjectKeys, pascalCaseTypes, upperSnakeStringUnions };

export default plugin;
