import type { Rule } from "@oxlint/plugins";

import { docsUrl } from "#helpers";

/**
 * `no-inline-object-types` — rejects an object shape written inline in a type
 * position, `{ a: string }`.
 *
 * A shape with no name cannot be referenced, documented, or found. Declaring it
 * as an `interface` gives the same shape a name that error messages, imports,
 * and the next reader can all use.
 */
export const noInlineObjectTypes: Rule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Rejects an object shape written inline in a type position.",
      url: docsUrl("concrete", "no-inline-object-types"),
    },
    schema: [],
    messages: {
      inlineObjectType:
        "Inline object type. Declare an `interface` and use its name here, so the shape can be referenced and documented.",
    },
  },
  createOnce(context) {
    return {
      TSTypeLiteral(node) {
        context.report({ node, messageId: "inlineObjectType" });
      },
    };
  },
};
