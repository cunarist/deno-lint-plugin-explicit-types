import type { Rule } from "@oxlint/plugins";

import { docsUrl } from "#helpers";

/**
 * `no-index-signatures` — rejects index signatures — `{ [key: string]: T }`.
 *
 * An index signature says every key is legal and every read succeeds. Typos
 * type-check, and the object doubles as a dictionary that is not a `Map`.
 */
export const noIndexSignatures: Rule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Rejects index signatures, `{ [key: string]: T }`.",
      url: docsUrl("concrete", "no-index-signatures"),
    },
    schema: [],
    messages: {
      indexSignature:
        "Index signature. Write concrete fields, or use a `Map` if the keys are genuinely dynamic.",
    },
  },
  createOnce(context) {
    return {
      TSIndexSignature(node) {
        context.report({ node, messageId: "indexSignature" });
      },
    };
  },
};
