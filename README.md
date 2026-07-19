# deno-lint-plugin-explicit-types

TypeScript style rules for `deno lint`. Types should get written out, not
derived.

## Setup

```jsonc
// deno.json
{
  "lint": {
    "plugins": [
      "jsr:@cunarist/deno-lint-plugin-explicit-types/concrete",
      "jsr:@cunarist/deno-lint-plugin-explicit-types/naming"
    ]
  }
}
```

Two plugins, added separately. Adding one turns on every rule in it, so turn one
off by id:

```jsonc
{ "lint": { "rules": { "exclude": ["explicit-concrete/no-type-assertion"] } } }
```

Or import the rules and build your own plugin, which gives you `concreteRules`,
`namingRules`, and all 12 rules individually:

```ts
// lint.ts
import {
  concreteRules,
  noEnum,
} from "jsr:@cunarist/deno-lint-plugin-explicit-types";

const plugin: Deno.lint.Plugin = {
  name: "my-types",
  rules: { ...concreteRules, "no-enum": noEnum },
};

export default plugin;
```

## `/concrete` — write the type out

A type is written, not computed. If a reader has to run the compiler in their
head to know what a value is, that's a defect.

```ts
// BAD - go read TaskSnapshot and apply two transforms
type Draft = Partial<Omit<TaskSnapshot, "id">>;

// GOOD
interface Draft {
  label: string | null;
  state: TaskState | null;
}
```

| Rule                                                           | Catches                                       |
| -------------------------------------------------------------- | --------------------------------------------- |
| [`no-utility-types`](src/concrete/no-utility-types.md)         | `Partial`, `Record`, `ReturnType`, 19 more    |
| [`no-keyof`](src/concrete/no-keyof.md)                         | A union nobody wrote down                     |
| [`no-typeof-type`](src/concrete/no-typeof-type.md)             | A type read backwards out of a value          |
| [`no-mapped-types`](src/concrete/no-mapped-types.md)           | `{ [K in Keys]: T }`                          |
| [`no-index-signatures`](src/concrete/no-index-signatures.md)   | `{ [key: string]: T }`, where every read lies |
| [`no-conditional-types`](src/concrete/no-conditional-types.md) | `T extends U ? A : B`, and `infer`            |
| [`require-return-type`](src/concrete/require-return-type.md)   | A function whose contract is in its body      |
| [`no-type-assertion`](src/concrete/no-type-assertion.md)       | `x as T`, overruling the compiler             |

`as const` and `satisfies` are allowed — both narrow rather than overrule.
Indexed access is too: `Options["retries"]` is how you name a type a library
already wrote.

## `/naming` — names carry the contract

```ts
// BAD
enum Status {
  Pending,
  Done,
}

// GOOD
type Status = "PENDING" | "DONE";
```

| Rule                                                                   | Catches                            |
| ---------------------------------------------------------------------- | ---------------------------------- |
| [`pascal-case-types`](src/naming/pascal-case-types.md)                 | A type name that isn't PascalCase  |
| [`upper-snake-string-unions`](src/naming/upper-snake-string-unions.md) | `"pending"` where `"PENDING"` fits |
| [`camel-case-object-keys`](src/naming/camel-case-object-keys.md)       | An object being used as a map      |
| [`no-enum`](src/naming/no-enum.md)                                     | `enum`, including `const enum`     |

These interlock: `no-enum` removes the construct, `upper-snake-string-unions`
governs the union that replaces it, and `camel-case-object-keys` keeps those
members out of object keys. So turning a `Status` into a value is a `switch`,
not an object you index into — and a `switch` stops compiling the day someone
adds a member.

## How opinionated is this?

Mainstream: `pascal-case-types`, `no-enum`, `no-type-assertion`,
`no-index-signatures`.

Deliberately stronger than most TypeScript codebases: `no-utility-types`,
`no-keyof`, `no-mapped-types`, `no-typeof-type`. Banning `Partial` means writing
the derived shape out, which costs duplication — that trade is the point, but it
is a real cost. Read the rule docs before adopting.

House style: `upper-snake-string-unions`. Common for enum-like tokens (GraphQL,
protobuf, action types), less so for option flags.

## Pairs well with

`no-explicit-any` and `no-non-null-assertion`, both built into Deno. This plugin
leaves them alone rather than duplicating them.

## Known limits

- **No rule options.** Deno's plugin API cannot configure a rule.
- **One file at a time.** No cross-file resolution, so `no-utility-types` sees
  `Partial<T>` where it is written but not through a local alias.
- **Syntax, not types.** `no-type-assertion` sees `x as T`, not an assertion
  laundered through a function signature.
- **A lint visitor can't satisfy `camel-case-object-keys`.** Its keys are AST
  node types and the API demands an object literal, so this package's rule files
  carry a `deno-lint-ignore-file` for it. Nothing is excluded repo-wide.

## License

MIT.
