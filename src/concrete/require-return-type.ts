/** Method kinds TypeScript forbids a return type on. */
const UNANNOTATABLE_METHOD_KINDS: readonly string[] = ["constructor", "set"];

/** A function-like node that may carry a `returnType`. */
type FunctionNode =
  | Deno.lint.FunctionDeclaration
  | Deno.lint.FunctionExpression
  | Deno.lint.ArrowFunctionExpression
  | Deno.lint.TSDeclareFunction
  | Deno.lint.TSEmptyBodyFunctionExpression;

/**
 * Whether this function is named rather than passed inline. A callback's type
 * is fixed by the signature it is handed to; only bound and declared functions
 * state a contract of their own.
 */
function isNamed(node: FunctionNode): boolean {
  const parent = node.parent;
  if (parent.type === "VariableDeclarator") return true;
  if (parent.type === "MethodDefinition") {
    return !UNANNOTATABLE_METHOD_KINDS.includes(parent.kind);
  }
  return false;
}

/**
 * `require-return-type` — requires a named function to declare its return type.
 *
 * Without one, the only way to learn what a function gives back is to read its
 * body to the end, including every branch. Callbacks are exempt: their type
 * comes from the parameter they are passed to, so writing it again adds noise
 * rather than information.
 */
export const requireReturnType: Deno.lint.Rule = {
  create(ctx) {
    function check(node: FunctionNode, always: boolean): void {
      if (!always && !isNamed(node)) return;
      if (node.returnType !== undefined) return;
      ctx.report({
        node: node.id ?? node,
        message: "Function has no return type.",
        hint:
          "Write the return type out, so the contract is readable without reading the body.",
      });
    }

    return {
      FunctionDeclaration(node) {
        check(node, true);
      },
      TSDeclareFunction(node) {
        check(node, true);
      },
      FunctionExpression(node) {
        check(node, false);
      },
      TSEmptyBodyFunctionExpression(node) {
        check(node, false);
      },
      ArrowFunctionExpression(node) {
        check(node, false);
      },
      TSMethodSignature(node) {
        if (node.returnType !== undefined) return;
        ctx.report({
          node: node.key,
          message: "Method signature has no return type.",
          hint:
            "Write the return type out, so the contract is readable without reading the body.",
        });
      },
    };
  },
};
