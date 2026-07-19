/** Whether a `TSAsExpression`'s annotation is the `const` of `as const`. */
function isConstAssertion(node: Deno.lint.TSAsExpression): boolean {
  const annotation = node.typeAnnotation;
  if (annotation.type !== "TSTypeReference") return false;
  const name = annotation.typeName;
  return name.type === "Identifier" && name.name === "const";
}

/**
 * `no-type-assertion` — rejects type assertions, `value as T` and `<T>value`.
 * `as const` is allowed.
 *
 * An assertion overrides the compiler rather than informing it. `as const` is
 * exempt: it narrows a literal to what is already written, it does not claim
 * anything the source does not say.
 */
export const noTypeAssertion: Deno.lint.Rule = {
  create(ctx) {
    return {
      TSAsExpression(node) {
        if (isConstAssertion(node)) return;
        ctx.report({
          node,
          message: "Type assertion with `as`.",
          hint:
            "Annotate the declaration, or narrow with `typeof`/`instanceof`. Only `as const` is allowed.",
        });
      },
      TSTypeAssertion(node) {
        ctx.report({
          node,
          message: "Angle-bracket type assertion.",
          hint:
            "Annotate the declaration, or narrow with `typeof`/`instanceof`. Only `as const` is allowed.",
        });
      },
    };
  },
};
