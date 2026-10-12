import type { Context, ESTree, Rule } from "@oxlint/plugins";

import { docsUrl } from "#helpers";

/** A name that starts uppercase and carries no underscores. */
const PASCAL_CASE_PATTERN = /^[A-Z][A-Za-z0-9]*$/;

/** Report an identifier whose name is not PascalCase. */
function checkPascalCase(
  context: Context,
  identifier: ESTree.BindingIdentifier | null,
  kind: string,
): void {
  if (identifier === null) return;
  if (PASCAL_CASE_PATTERN.test(identifier.name)) return;
  context.report({
    node: identifier,
    messageId: "notPascalCase",
    data: { kind, name: identifier.name },
  });
}

/**
 * `pascal-case-types` — requires class, interface, type alias, and enum
 * declaration names to be PascalCase.
 *
 * A type's name is the only part of it most readers ever see. PascalCase is the
 * one signal that a bare identifier denotes a type rather than a value, so a
 * name that breaks the convention makes every use site ambiguous.
 */
export const pascalCaseTypes: Rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Requires class, interface, type alias, and enum declaration names to be PascalCase.",
      url: docsUrl("naming", "pascal-case-types"),
    },
    schema: [],
    messages: {
      notPascalCase:
        "{{kind}} name `{{name}}` is not PascalCase. Start the name with an uppercase letter and drop underscores, e.g. `UserProfile`.",
    },
  },
  createOnce(context) {
    return {
      ClassDeclaration(node) {
        checkPascalCase(context, node.id, "Class");
      },
      ClassExpression(node) {
        checkPascalCase(context, node.id, "Class");
      },
      TSInterfaceDeclaration(node) {
        checkPascalCase(context, node.id, "Interface");
      },
      TSTypeAliasDeclaration(node) {
        checkPascalCase(context, node.id, "Type alias");
      },
      TSEnumDeclaration(node) {
        checkPascalCase(context, node.id, "Enum");
      },
    };
  },
};
