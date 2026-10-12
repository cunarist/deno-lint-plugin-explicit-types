import type { Rule } from "@oxlint/plugins";

import { docsUrl } from "#helpers";

/**
 * `no-typeof-type` — rejects `typeof value` used in a type position.
 *
 * `typeof value` in a type position makes a type depend on an initializer.
 * Editing the value silently rewrites the contract every annotation refers to.
 */
export const noTypeofType: Rule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Rejects `typeof value` used in a type position.",
      url: docsUrl("concrete", "no-typeof-type"),
    },
    schema: [],
    messages: {
      typeofType:
        "`typeof` in a type position. Declare the type on its own and annotate the value with it, rather than deriving one from the other.",
    },
  },
  createOnce(context) {
    return {
      TSTypeQuery(node) {
        context.report({ node, messageId: "typeofType" });
      },
    };
  },
};
