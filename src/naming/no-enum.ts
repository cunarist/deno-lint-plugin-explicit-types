/**
 * `no-enum` — rejects every `enum` declaration, including `const enum` and string enums.
 *
 * An `enum` is the one TypeScript type that emits a runtime value, and its
 * members are opaque at the boundary: a numeric enum serializes as a number
 * nobody can read, and the declaration must be imported everywhere the value is
 * named. A string union is the same closed set with none of that.
 */
export const noEnum: Deno.lint.Rule = {
  create(ctx) {
    return {
      TSEnumDeclaration(node) {
        ctx.report({
          node: node.id,
          message: `Enum \`${node.id.name}\` declares a runtime value.`,
          hint:
            'Use an UPPER_SNAKE_CASE string union type instead, e.g. `type Status = "OPEN" | "CLOSED";`.',
        });
      },
    };
  },
};
