// deno-lint-ignore-file explicit-naming/camel-case-object-keys -- a lint
// visitor is a dispatch table keyed by AST node type; the API takes an
// object, and building it from pairs would drop the typed `node` param.

/**
 * `camel-case-object-keys` — `id`, `userId`, `http2Push` — lowercase first letter, no separators. */
const CAMEL_CASE_PATTERN = /^[a-z][A-Za-z0-9]*$/;

/** The written form of a key, or `null` if it cannot be read statically. */
function keyText(key: Deno.lint.Node): string | null {
  if (key.type === "Identifier") return key.name;
  if (key.type === "Literal") {
    if (typeof key.value === "string") return key.value;
    if (typeof key.value === "number") return String(key.value);
  }
  return null;
}

/** Requires object literal keys and interface or type-literal members to be camelCase.
 *
 * An object is a struct, not a map. A key that isn't camelCase — `PENDING`,
 * `"Content-Type"`, `0` — is the tell that the object is being indexed rather
 * than read field by field, and an indexed object silently returns `undefined`
 * for a case nobody added.
 */
export const camelCaseObjectKeys: Deno.lint.Rule = {
  create(ctx) {
    function check(key: Deno.lint.Node, computed: boolean): void {
      // A computed key cannot be judged from syntax alone.
      if (computed) return;
      const text = keyText(key);
      if (text === null || CAMEL_CASE_PATTERN.test(text)) return;
      ctx.report({
        node: key,
        message: `Object key \`${text}\` is not camelCase.`,
        hint:
          "Objects are structs, not maps. If this is a lookup keyed by a string union, write a function that switches on the union instead, so a new member is a compile error.",
      });
    }

    return {
      Property(node) {
        // `Property` also covers destructuring patterns, which bind names
        // rather than declare keys.
        if (node.parent.type !== "ObjectExpression") return;
        check(node.key, node.computed);
      },
      TSPropertySignature(node) {
        check(node.key, node.computed);
      },
    };
  },
};
