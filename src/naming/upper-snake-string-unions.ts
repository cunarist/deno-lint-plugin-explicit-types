// deno-lint-ignore-file explicit-naming/camel-case-object-keys -- a lint
// visitor is a dispatch table keyed by AST node type; the API takes an
// object, and building it from pairs would drop the typed `node` param.

import { literalString } from "#helpers";

/** `ONE`, `ONE_TWO`, `HTTP2_PUSH` — uppercase segments joined by underscores. */
const UPPER_SNAKE_CASE_PATTERN = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/;

/**
 * `upper-snake-string-unions` — requires every string literal member of a union
 * type alias to be UPPER_SNAKE_CASE.
 *
 * A string union is an enumeration written in the type system. Casing it like a
 * constant rather than like prose is what keeps the member set readable as a
 * closed list of tokens instead of a set of display strings.
 */
export const upperSnakeStringUnions: Deno.lint.Rule = {
  create(ctx) {
    return {
      TSTypeAliasDeclaration(node) {
        const annotation = node.typeAnnotation;
        if (annotation.type !== "TSUnionType") return;
        for (const member of annotation.types) {
          if (member.type !== "TSLiteralType") continue;
          const value = literalString(member.literal);
          if (value === null) continue;
          if (UPPER_SNAKE_CASE_PATTERN.test(value)) continue;
          ctx.report({
            node: member,
            message: `String union member "${value}" is not UPPER_SNAKE_CASE.`,
            hint:
              'Rewrite the member as an uppercase token, e.g. "IN_PROGRESS".',
          });
        }
      },
    };
  },
};
