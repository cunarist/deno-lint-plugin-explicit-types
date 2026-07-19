/**
 * Generic AST helpers.
 *
 * IMPORTANT: lint AST nodes expose their fields as prototype getters, so
 * `Object.keys(node)` returns an empty array. Never traverse generically with
 * `Object.keys`/`Object.values` — always access fields by name.
 */

/** Any node carrying a source range, which is all `context.report` needs. */
export interface RangedNode {
  readonly range: Deno.lint.Range;
}

/**
 * The `typeName` of a `TSTypeReference`.
 *
 * Deno's typings have no `EntityName` alias — the field is this three-member
 * union, and `ThisExpression` is in it because `this` is a legal type. Derived
 * from the field itself so it cannot drift.
 */
export type TypeNameNode = Deno.lint.TSTypeReference["typeName"];

/**
 * Dotted name of a type reference's `typeName`, e.g. `React.ReactNode`.
 * Returns `null` for anything that is not a plain qualified name.
 */
export function typeName(node: TypeNameNode): string | null {
  switch (node.type) {
    case "Identifier":
      return node.name;
    case "ThisExpression":
      return "this";
    case "TSQualifiedName": {
      const left = typeName(node.left);
      if (left === null) return null;
      return `${left}.${node.right.name}`;
    }
    default:
      return null;
  }
}

/** The last segment of a qualified type name, e.g. `A.B.Partial` -> `Partial`. */
export function typeNameTail(node: TypeNameNode): string | null {
  const name = typeName(node);
  if (name === null) return null;
  const segments = name.split(".");
  return segments[segments.length - 1] ?? null;
}

/** The string value of a literal node, or `null` if it is not a string. */
export function literalString(node: Deno.lint.Node): string | null {
  if (node.type !== "Literal") return null;
  return typeof node.value === "string" ? node.value : null;
}

/** Name of an identifier that may be absent, e.g. an anonymous class's `id`. */
export function identifierName(
  node: Deno.lint.Identifier | null | undefined,
): string | null {
  return node ? node.name : null;
}
