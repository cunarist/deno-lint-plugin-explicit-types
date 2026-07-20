import { keyText } from "#helpers";

/**
 * `no-optional-null` — rejects a binding that is both marked `?` and unioned
 * with `null`.
 *
 * `?` already means the value can be absent, so adding `| null` gives two ways
 * to say the same thing and leaves the reader two cases to handle for one
 * condition.
 */
export const noOptionalNull: Deno.lint.Rule = {
  create(ctx) {
    /** The `?`-marked binding a type annotation belongs to, if it is one. */
    function optionalBinding(
      annotation: Deno.lint.TSTypeAnnotation,
    ): Deno.lint.Node | null {
      const owner = annotation.parent;
      switch (owner.type) {
        case "Identifier":
          return owner.optional ? owner : null;
        case "TSPropertySignature":
        case "PropertyDefinition":
          return owner.optional ? owner.key : null;
        default:
          return null;
      }
    }

    return {
      TSNullKeyword(node) {
        const parent = node.parent;
        // Step past a union so `T | null` reads as the annotation itself.
        const annotation = parent.type === "TSUnionType"
          ? parent.parent
          : parent;
        if (annotation.type !== "TSTypeAnnotation") return;
        const binding = optionalBinding(annotation);
        if (binding === null) return;
        const name = binding.type === "Identifier"
          ? binding.name
          : keyText(binding);
        ctx.report({
          node,
          message: name === null
            ? "Optional binding also admits `null`."
            : `Optional \`${name}\` also admits \`null\`.`,
          hint:
            "Drop the `| null`, or drop the `?` so absence has to be written on purpose.",
        });
      },
    };
  },
};
