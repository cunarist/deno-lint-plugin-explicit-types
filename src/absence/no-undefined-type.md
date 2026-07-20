# no-undefined-type

Rejects the `undefined` keyword in any type position.

## Why

`?` is the undefined type. Writing both says the same thing twice, and writing
only `undefined` says it the long way, so a codebase that mixes them has two
forms for one idea. This rule picks `?`.

A return type or a variable cannot take `?`, so those say absence with `| null`.

## Examples

```ts
// BAD
interface Job {
  cursor?: string | undefined;
}
function render(host: Element | undefined): void {}
function findNote(id: string): Note | undefined {}

// GOOD
interface Job {
  cursor?: string;
}
function render(host?: Element): void {}
function findNote(id: string): Note | null {}
```

## Notes

- Fires everywhere the keyword is legal: members, parameters, return types,
  variable annotations, type aliases, and generic arguments.
- On a member or a parameter, `?` is the replacement. It is shorter and it keeps
  the same meaning for a callback whose shape a library fixed — a Lit `ref`
  handler is `(el?: Element) => void`.
- `?` is not available on a return type or a variable, so those take `| null`
  and a `?? null` at the boundary.
- Writing both, `a?: T | undefined`, reports here. `?` alone is the fix.
- A required parameter that must accept absence in a non-trailing position has
  no `?` form — `f(a?: number, b: string)` will not compile. Use `| null` there.
- `void` is untouched. A function returning nothing still writes `: void`.
- Indexed access still names someone else's `undefined`: `Options["signal"]` is
  clean even when that field is optional in their declaration.
- **Not caught: `accessor a: string | undefined`.** Deno's lint AST never walks
  an `AccessorProperty` type annotation and the node carries no `typeAnnotation`
  field at runtime (verified against 2.9.3), so the type is unreachable.
- Syntax only. `let x;` has no annotation and is not this rule's business.
