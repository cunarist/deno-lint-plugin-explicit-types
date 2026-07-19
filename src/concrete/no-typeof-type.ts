// deno-lint-ignore-file explicit-naming/camel-case-object-keys -- a lint
// visitor is a dispatch table keyed by AST node type; the API takes an
// object, and building it from pairs would drop the typed `node` param.

/**
 * `no-typeof-type` — rejects `typeof value` used in a type position.
 *
 * `typeof value` in a type position makes a type depend on an initializer.
 * Editing the value silently rewrites the contract every annotation refers to.
 */
export const noTypeofType: Deno.lint.Rule = {
  create(ctx) {
    return {
      TSTypeQuery(node) {
        ctx.report({
          node,
          message: "`typeof` in a type position.",
          hint:
            "Declare the type on its own and annotate the value with it, rather than deriving one from the other.",
        });
      },
    };
  },
};
