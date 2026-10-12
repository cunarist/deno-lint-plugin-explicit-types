import type { Rule } from "@oxlint/plugins";

import { docsUrl } from "#helpers";

/**
 * `no-keyof` — rejects the `keyof` type operator in any type position.
 *
 * `keyof T` is a union nobody wrote down. Its members change silently whenever
 * `T` gains or loses a field, and every use site changes with it.
 */
export const noKeyof: Rule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Rejects the `keyof` type operator in any type position.",
      url: docsUrl("concrete", "no-keyof"),
    },
    schema: [],
    messages: {
      keyof:
        "`keyof` in a type position. Write the union of key names out, so adding a field cannot silently widen it.",
    },
  },
  createOnce(context) {
    return {
      TSTypeOperator(node) {
        if (node.operator !== "keyof") return;
        context.report({ node, messageId: "keyof" });
      },
    };
  },
};
