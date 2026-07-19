/**
 * `no-inline-object-types` — rejects an object shape written inline in a type
 * position, `{ a: string }`.
 *
 * A shape with no name cannot be referenced, documented, or found. Declaring it
 * as an `interface` gives the same shape a name that error messages, imports,
 * and the next reader can all use.
 */
export const noInlineObjectTypes: Deno.lint.Rule = {
  create(ctx) {
    return {
      TSTypeLiteral(node) {
        ctx.report({
          node,
          message: "Inline object type.",
          hint:
            "Declare an `interface` and use its name here, so the shape can be referenced and documented.",
        });
      },
    };
  },
};
