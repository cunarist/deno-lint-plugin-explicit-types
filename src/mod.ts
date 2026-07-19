/**
 * Individual TypeScript style rules and preset rule records, for composing your
 * own plugin. See the README for usage.
 *
 * Each group also ships as a ready-made plugin at its own entry point:
 * `/concrete`, `/naming`.
 *
 * ```ts
 * import { concreteRules, noEnum } from "@cunarist/deno-lint-plugin-explicit-types";
 *
 * const plugin: Deno.lint.Plugin = {
 *   name: "my-types",
 *   rules: { ...concreteRules, "no-enum": noEnum },
 * };
 *
 * export default plugin;
 * ```
 *
 * @module
 */

export * from "#concrete";
export * from "#naming";
