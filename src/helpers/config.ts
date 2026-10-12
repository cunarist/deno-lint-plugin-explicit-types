import type { Plugin } from "@oxlint/plugins";
import type { OxlintConfig } from "oxlint";

/** The npm name this package is published under, for `jsPlugins` specifiers. */
const PACKAGE_NAME = "@cunarist/oxlint-plugin-explicit-types";

/**
 * An Oxlint config that loads one preset and turns every rule in it on.
 *
 * Oxlint loads a plugin without enabling any of its rules, so a preset is a
 * config to `extends` rather than a plugin field. The plugin specifier is the
 * package export, because Oxlint rejects relative specifiers inside `extends`.
 */
export function presetConfig(
  preset: string,
  pluginName: string,
  rules: Plugin["rules"],
): OxlintConfig {
  return {
    jsPlugins: [`${PACKAGE_NAME}/${preset}`],
    rules: Object.fromEntries(
      Object.keys(rules).map((id): [string, "error"] => [`${pluginName}/${id}`, "error"]),
    ),
  };
}
