import { keyText } from "#helpers";

/** `OPEN`, `IN_PROGRESS`, `HTTP2_PUSH` — the casing a string union member has. */
const UPPER_SNAKE_CASE_PATTERN = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/;

/**
 * `no-upper-snake-object-keys` — rejects UPPER_SNAKE_CASE object keys and type
 * members.
 *
 * That casing is what a string union member looks like, so an object wearing it
 * is a lookup table keyed by the union — and a lookup table stays silent when
 * the union gains a member. A `switch` does not.
 */
export const noUpperSnakeObjectKeys: Deno.lint.Rule = {
  create(ctx) {
    function check(key: Deno.lint.Node, computed: boolean): void {
      // A computed key cannot be judged from syntax alone.
      if (computed) return;
      const text = keyText(key);
      if (text === null || !UPPER_SNAKE_CASE_PATTERN.test(text)) return;
      ctx.report({
        node: key,
        message: `Object key \`${text}\` is UPPER_SNAKE_CASE.`,
        hint:
          "That is a string union member, so this object is a lookup keyed by the union. Write a function that switches on it instead, and a new member becomes a compile error.",
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
