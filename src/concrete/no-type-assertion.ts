import type { ESTree, Rule } from "@oxlint/plugins";

import { docsUrl } from "#helpers";

/** Whether a `TSAsExpression`'s annotation is the `const` of `as const`. */
function isConstAssertion(node: ESTree.TSAsExpression): boolean {
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
export const noTypeAssertion: Rule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Rejects type assertions, `value as T` and `<T>value`. `as const` is allowed.",
      url: docsUrl("concrete", "no-type-assertion"),
    },
    schema: [],
    messages: {
      asAssertion:
        "Type assertion with `as`. Annotate the declaration, or narrow with `typeof`/`instanceof`. Only `as const` is allowed.",
      angleBracketAssertion:
        "Angle-bracket type assertion. Annotate the declaration, or narrow with `typeof`/`instanceof`. Only `as const` is allowed.",
    },
  },
  createOnce(context) {
    return {
      TSAsExpression(node) {
        if (isConstAssertion(node)) return;
        context.report({ node, messageId: "asAssertion" });
      },
      TSTypeAssertion(node) {
        context.report({ node, messageId: "angleBracketAssertion" });
      },
    };
  },
};
