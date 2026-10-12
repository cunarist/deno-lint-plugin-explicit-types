/**
 * Generic AST helpers.
 *
 * Oxlint hands rules an ESTree / TS-ESTree tree, typed by the `ESTree`
 * namespace of `@oxlint/plugins`. Access fields by name rather than walking
 * `Object.keys(node)` — the tree is deserialized lazily, so generic traversal
 * is both slow and not guaranteed to see every field.
 */

import type { ESTree } from "@oxlint/plugins";

/**
 * The `typeName` of a `TSTypeReference`.
 *
 * Derived from the field itself so it cannot drift: an identifier, a
 * qualified name, or `this`, which is a legal type.
 */
export type TypeNameNode = ESTree.TSTypeReference["typeName"];

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

/**
 * The written form of an object or type member key, or `null` when it cannot
 * be read from syntax alone — a computed key such as `[token]`.
 */
export function keyText(key: ESTree.Node): string | null {
  if (key.type === "Identifier") return key.name;
  return literalString(key);
}

/** The string value of a literal node, or `null` if it is not a string. */
export function literalString(node: ESTree.Node): string | null {
  if (node.type !== "Literal") return null;
  return typeof node.value === "string" ? node.value : null;
}
