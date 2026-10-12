import type { Rule } from "@oxlint/plugins";

import { docsUrl } from "#helpers";

/**
 * `no-undefined-type` — rejects the `undefined` keyword in any type position.
 *
 * `undefined` is what the language returns when nobody said anything; `null` is
 * what someone wrote. A member or parameter says absence with `?`, everything
 * else says it with `null`, and the keyword never appears in a signature.
 */
export const noUndefinedType: Rule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Rejects the `undefined` keyword in any type position.",
      url: docsUrl("absence", "no-undefined-type"),
    },
    schema: [],
    messages: {
      undefinedType:
        "`undefined` in a type position. Mark it `?` instead, or write `null` and normalise at the boundary.",
    },
  },
  createOnce(context) {
    return {
      TSUndefinedKeyword(node) {
        context.report({ node, messageId: "undefinedType" });
      },
    };
  },
};
