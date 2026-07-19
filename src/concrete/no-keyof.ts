/**
 * `no-keyof` — rejects the `keyof` type operator in any type position.
 *
 * `keyof T` is a union nobody wrote down. Its members change silently whenever
 * `T` gains or loses a field, and every use site changes with it.
 */
export const noKeyof: Deno.lint.Rule = {
  create(ctx) {
    return {
      TSTypeOperator(node) {
        if (node.operator !== "keyof") return;
        ctx.report({
          node,
          message: "`keyof` in a type position.",
          hint:
            "Write the union of key names out, so adding a field cannot silently widen it.",
        });
      },
    };
  },
};
