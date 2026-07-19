// deno-lint-ignore-file explicit-naming/camel-case-object-keys -- a lint
// visitor is a dispatch table keyed by AST node type; the API takes an
// object, and building it from pairs would drop the typed `node` param.

import { typeNameTail } from "#helpers";

/** The 22 built-in TypeScript utility types this rule rejects. */
const UTILITY_TYPE_NAMES: readonly string[] = [
  "Awaited",
  "Partial",
  "Required",
  "Readonly",
  "Record",
  "Pick",
  "Omit",
  "Exclude",
  "Extract",
  "NonNullable",
  "Parameters",
  "ConstructorParameters",
  "ReturnType",
  "InstanceType",
  "ThisParameterType",
  "OmitThisParameter",
  "ThisType",
  "NoInfer",
  "Uppercase",
  "Lowercase",
  "Capitalize",
  "Uncapitalize",
];

/**
 * `no-utility-types` — rejects the 22 built-in TypeScript utility types.
 *
 * A built-in utility type names a transformation, not a shape. The reader has
 * to apply `Partial`/`Omit`/`ReturnType` in their head against a definition
 * that lives somewhere else to know what the value actually is.
 */
export const noUtilityTypes: Deno.lint.Rule = {
  create(ctx) {
    return {
      TSTypeReference(node) {
        const name = typeNameTail(node.typeName);
        if (name === null || !UTILITY_TYPE_NAMES.includes(name)) return;
        ctx.report({
          node,
          message: `Utility type \`${name}\`.`,
          hint:
            "Write the resulting type out, so the shape is readable without applying the transformation.",
        });
      },
    };
  },
};
