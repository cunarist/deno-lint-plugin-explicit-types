// deno-lint-ignore-file explicit-naming/camel-case-object-keys -- a lint
// visitor is a dispatch table keyed by AST node type; the API takes an
// object, and building it from pairs would drop the typed `node` param.

/**
 * `no-conditional-types` — rejects conditional types and the `infer` keyword.
 *
 * A conditional type is a branch the reader has to evaluate before they know
 * what a value is, and `infer` names a type nobody wrote. Both move the answer
 * out of the declaration and into the compiler.
 */
export const noConditionalTypes: Deno.lint.Rule = {
  create(ctx) {
    return {
      TSConditionalType(node) {
        ctx.report({
          node,
          message: "Conditional type.",
          hint:
            "Write each resulting type out and name it, so the reader does not have to evaluate the branch.",
        });
      },
      TSInferType(node) {
        ctx.report({
          node,
          message: "`infer` in a type position.",
          hint:
            "Name the type you are extracting and write it out, rather than having the compiler recover it.",
        });
      },
    };
  },
};
