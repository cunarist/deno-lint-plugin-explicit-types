/**
 * `no-index-signatures` — rejects index signatures — `{ [key: string]: T }`.
 *
 * An index signature says every key is legal and every read succeeds. Typos
 * type-check, and the object doubles as a dictionary that is not a `Map`.
 */
export const noIndexSignatures: Deno.lint.Rule = {
  create(ctx) {
    return {
      TSIndexSignature(node) {
        ctx.report({
          node,
          message: "Index signature.",
          hint:
            "Write concrete fields, or use a `Map` if the keys are genuinely dynamic.",
        });
      },
    };
  },
};
