// deno-lint-ignore-file explicit-naming/camel-case-object-keys -- a lint
// visitor is a dispatch table keyed by AST node type; the API takes an
// object, and building it from pairs would drop the typed `node` param.

/**
 * `no-mapped-types` — rejects mapped types — `{ [K in Keys]: T }`.
 *
 * A mapped type generates its fields from another type. Nothing in the source
 * lists what the object actually has, so the shape can only be read by
 * evaluating the mapping.
 */
export const noMappedTypes: Deno.lint.Rule = {
  create(ctx) {
    return {
      TSMappedType(node) {
        ctx.report({
          node,
          message: "Mapped type.",
          hint:
            "Write the fields out, or use a `Map` if the keys are genuinely dynamic.",
        });
      },
    };
  },
};
