import type { Rule } from "@oxlint/plugins";

import { docsUrl } from "#helpers";

/**
 * `no-mapped-types` — rejects mapped types — `{ [K in Keys]: T }`.
 *
 * A mapped type generates its fields from another type. Nothing in the source
 * lists what the object actually has, so the shape can only be read by
 * evaluating the mapping.
 */
export const noMappedTypes: Rule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Rejects mapped types, `{ [K in Keys]: T }`.",
      url: docsUrl("concrete", "no-mapped-types"),
    },
    schema: [],
    messages: {
      mappedType:
        "Mapped type. Write the fields out, or use a `Map` if the keys are genuinely dynamic.",
    },
  },
  createOnce(context) {
    return {
      TSMappedType(node) {
        context.report({ node, messageId: "mappedType" });
      },
    };
  },
};
