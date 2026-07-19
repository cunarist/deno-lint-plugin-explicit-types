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
