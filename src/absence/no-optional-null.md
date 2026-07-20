# no-optional-null

Rejects a binding that is both marked `?` and unioned with `null`.

## Why

If a value can be empty in two ways, what its empty value is stops being a
definite thing. `?` and `| null` both mean absent, so the reader cannot tell
which one arrives, and the body has to handle both for one condition:

```ts
function open(path?: string | null): void {
  if (path === undefined || path === null) {} // both, every time
}
open();
open(null); // same meaning, different call
```

Pick one: `?` if the value can simply be left out, `| null` if the caller ought
to say so.

## Examples

```ts
// BAD
function open(path?: string | null): void {}
interface Job {
  cursor?: string | null;
}

// GOOD - absence is omission
function open(path?: string): void {}

// GOOD - absence is a value the caller has to write
function open(path: string | null): void {}
interface Job {
  cursor: string | null;
}
```

## Notes

- Fires on parameters and on members. `?` is only legal in those two places —
  `let v?: T` is a syntax error — so there is nothing else to cover.
- `a?: T | undefined` is the other way to write absence twice, and
  `no-undefined-type` rejects it.
- Getters and setters cannot be optional (`get g?()` is a syntax error), so a
  `| null` return type on one is clean.
- A default value is not the `?` marker, so `f(path: string | null = null)` is
  clean. Absence still has one spelling there — the default supplies `null`.
- Covers a bare `p?: null` as well as a union, and applies to function types and
  method signatures the same way as to declarations.
- **Not caught: `accessor a?: string | null`.** Deno's lint AST never walks an
  `AccessorProperty` type annotation and the node carries no `typeAnnotation`
  field at runtime (verified against 2.9.3), so the type is unreachable.
- The choice between the two fixes is a real one. `?` lets the caller forget the
  value; `| null` makes them write the absence. Take the second when they ought
  to decide.
