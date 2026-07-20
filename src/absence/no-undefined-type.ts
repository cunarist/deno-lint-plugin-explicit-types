/**
 * `no-undefined-type` — rejects the `undefined` keyword in any type position.
 *
 * `undefined` is what the language returns when nobody said anything; `null` is
 * what someone wrote. A member or parameter says absence with `?`, everything
 * else says it with `null`, and the keyword never appears in a signature.
 */
export const noUndefinedType: Deno.lint.Rule = {
  create(ctx) {
    return {
      TSUndefinedKeyword(node) {
        ctx.report({
          node,
          message: "`undefined` in a type position.",
          hint:
            "Mark it `?` instead, or write `null` and normalise at the boundary.",
        });
      },
    };
  },
};
