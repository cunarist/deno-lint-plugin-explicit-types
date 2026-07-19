# camel-case-object-keys

Requires every object literal key and every interface or type-literal member to
match `/^[a-z][A-Za-z0-9]*$/` — camelCase.

## Why

An object is a struct: a fixed set of named fields, each read on its own. A map
is something else — a lookup where the key is data. TypeScript spells both with
the same braces, and the casing of the keys is what tells them apart.

The moment an object is keyed by the members of a string union, the compiler
stops helping. Adding `"CANCELLED"` to the union does not make the lookup table
a compile error; it makes the lookup return `undefined` at runtime, in whichever
branch happens to hit the new state first. A `switch` on the same union fails to
compile the day the member is added, which is the whole point of having written
the union down.

This is the value-level half of a ban the type-level rules already make:
[`no-index-signatures`](../concrete/no-index-signatures.md) rejects
`{ [key: string]: T }` and [`no-mapped-types`](../concrete/no-mapped-types.md)
rejects `{ [K in Keys]: T }`. A hand-written
`interface Labels { PENDING: string }` slips past both, and so does the object
literal that satisfies it.

It also closes a gap this package opens itself:
[`upper-snake-string-unions`](upper-snake-string-unions.md) requires union
members to be UPPER_SNAKE_CASE, which is exactly the casing a lookup table keyed
by them would have.

## Examples

```ts
type TaskState = "PENDING" | "DONE";

// BAD - add "CANCELLED" to TaskState and this still compiles
interface Labels {
  PENDING: string;
  DONE: string;
}

const LABELS: Labels = { PENDING: "Waiting", DONE: "Finished" };
const text = LABELS[state];

// GOOD - add "CANCELLED" and this stops compiling
function labelOf(state: TaskState): string {
  switch (state) {
    case "PENDING":
      return "Waiting";
    case "DONE":
      return "Finished";
  }
}
```

## Notes

- Deno's built-in `camelcase` rule does not replace this one. It already catches
  `snake_case` keys, but it accepts `PENDING` as a constant and it accepts any
  quoted key — its own hint offers quoting as the way to silence it. Those two
  forms are precisely the ones a map-shaped object uses.
- Quoting is not an escape hatch. `{ "PENDING": 1 }` and
  `interface Labels { "PENDING": string }` fire exactly as the unquoted forms do
  — the rule reads the spelling, not the syntax around it. A quoted key is only
  allowed when the name itself is camelCase, as in `{ "userId": 1 }`. Quoted
  keys still have their place at a wire boundary — see below — but there they
  work because they are bracket accesses on a value, not keys on a declaration.
- Class members are deliberately not checked. `static MAX_RETRIES = 5` is a
  constant, not a map key.
- Destructuring is not checked. `const { user_id } = row` binds a name rather
  than declaring a key, and the built-in `camelcase` rule covers it.
- Numeric keys fire. `{ 0: "a", 1: "b" }` is an array written as an object.
- Computed keys are skipped. `{ [key]: value }` cannot be judged from syntax —
  though the index signature you would need to type it is already rejected by
  `no-index-signatures`.
- Shorthand properties and method shorthand are checked like any other key:
  `{ user_id }` and `{ my_method() {} }` both fire.
- A Deno lint plugin meets this rule halfway. The API is map-shaped in two
  places: `rules` is keyed by kebab-case rule id, and the visitor a rule returns
  is keyed by AST node type (`{ TSTypeOperator(node) {…} }`). The first conforms
  cleanly — build it with `Object.fromEntries` from `[id, rule]` pairs and the
  ids move into value position, which is what the rule is asking for. The second
  does not: the same trick type-checks, but the `node` parameter degrades to
  `any`, so this package keeps the object literal and marks those files with a
  `deno-lint-ignore-file` that names the reason.
- External payloads are not a reason to weaken the rule. A wire format spelled
  `user_id` never needs a type naming those keys — see below.

## Crossing the boundary

Parse inside one module, reach into the result with quoted string keys, and hand
back a camelCase struct. Nothing downstream ever sees the wire spelling.

```ts
// wire.ts — the only module that knows the wire format

interface UserRow {
  userId: string;
  displayName: string;
}

export function toUserRow(responseText: string): UserRow {
  const jsonParsed: any = JSON.parse(responseText);
  return {
    userId: jsonParsed["user_id"],
    displayName: jsonParsed["profile"]["INNER_FIELD"],
  };
}
```

This needs no exclusion. The foreign names appear as string literals in a
bracket access, not as keys, so there is nothing for the rule to report —
verified against a real `deno lint` run.

Note the signature: `(string) => UserRow`. The untyped value never leaves the
function, so callers get a struct and the wire spelling stops here.

Declaring the wire shape as a type would be the mistake. An
`interface UserWire { "user_id": string }` moves the foreign spelling into the
type system, where it outlives the boundary and every later reader has to carry
it — and it is what makes the rule fire in the first place. The `any` is doing
real work: until this function assigns a shape, the value genuinely has none.

`no-explicit-any` will flag that annotation. Ignore it on the one line, or drop
the annotation entirely — `JSON.parse` already returns `any`, so
`const jsonParsed = JSON.parse(responseText)` behaves identically and the rule
stays quiet. Writing it out is the honest version; both were checked.
