/** A name that starts uppercase and carries no underscores. */
const PASCAL_CASE_PATTERN = /^[A-Z][A-Za-z0-9]*$/;

/** Report an identifier whose name is not PascalCase. */
function checkPascalCase(
  ctx: Deno.lint.RuleContext,
  identifier: Deno.lint.Identifier | null,
  kind: string,
): void {
  if (identifier === null) return;
  if (PASCAL_CASE_PATTERN.test(identifier.name)) return;
  ctx.report({
    node: identifier,
    message: `${kind} name \`${identifier.name}\` is not PascalCase.`,
    hint:
      "Start the name with an uppercase letter and drop underscores, e.g. `UserProfile`.",
  });
}

/** Requires class, interface, type alias, and enum declaration names to be PascalCase.
 *
 * A type's name is the only part of it most readers ever see. PascalCase is the
 * one signal that a bare identifier denotes a type rather than a value, so a
 * name that breaks the convention makes every use site ambiguous.
 */
export const pascalCaseTypes: Deno.lint.Rule = {
  create(ctx) {
    return {
      ClassDeclaration(node) {
        checkPascalCase(ctx, node.id, "Class");
      },
      ClassExpression(node) {
        checkPascalCase(ctx, node.id, "Class");
      },
      TSInterfaceDeclaration(node) {
        checkPascalCase(ctx, node.id, "Interface");
      },
      TSTypeAliasDeclaration(node) {
        checkPascalCase(ctx, node.id, "Type alias");
      },
      TSEnumDeclaration(node) {
        checkPascalCase(ctx, node.id, "Enum");
      },
    };
  },
};
