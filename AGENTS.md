# deno-lint-plugin-explicit-types

A Deno lint plugin for TypeScript style, published to jsr.io. Sibling of
`../deno-lint-plugin-lit`; this is the home for the general-TS rules that plugin
deliberately excluded as out of scope.

Source of the rules: `../memona` — `user_app/scripts/deno-lint-plugin.ts` (the
`restricted-types` mega-rule plus several standalone rules) and the TypeScript
section of `.agents/memory/coding-standards.md`. That is the house style and it
wins on any conflict.

**The through-line:** a type is written out, not derived. If the compiler can
infer it, that is convenience; if the _reader_ has to run the compiler in their
head to know what a value is, that is a defect. Every rule here removes one way
to leave a type implicit — utility types, `keyof`, `typeof`, mapped types, index
signatures, conditional types, and assertions.

---

## Working style

Keep responses short. State the decision and what changed — no restating
rationale already written here, no summarizing edits the user can read. Detail
belongs in this file, not in chat.

## Project conventions

- `deno.json` is the only config. Strict TS.
- `deno fmt`, `deno check`, and `deno lint` must all pass on this package
  itself.
- **This package lints itself with its own rules, with nothing excluded
  repo-wide.** `deno.json` loads `./src/concrete/mod.ts` and
  `./src/naming/mod.ts` as lint plugins, so a new rule immediately applies to
  the source that implements it. When a rule fires here, fix the source.
- `camel-case-object-keys` hits two dispatch tables this package cannot avoid,
  and they are handled differently on purpose:
  - **Rule records** (`concreteRules`, `namingRules`) are built with
    `Object.fromEntries` from `[id, rule]` pairs. A rule record really is a
    lookup keyed by rule id, so the ids belong in value position — the rule is
    right, and conforming costs nothing.
  - **Lint visitors** keep their object literal and carry a file-level
    `deno-lint-ignore-file` naming the rule and the reason. Building a visitor
    from pairs type-checks, but the `node` parameter degrades to `any` —
    verified — which trades away exactly what this package exists to protect.
    Prefer that narrow, stated exception over a repo-wide `rules.exclude`.
- Every rule has tests. Use `Deno.lint.runPlugin`, which is only available under
  `deno test`.
- Annotate the plugin as `Deno.lint.Plugin` — visitor callback params infer from
  it, and JSR's slow-types check needs the explicit public type.
- **Every exported symbol needs JSDoc, and every entry point needs a `@module`
  block.** JSR scores the package on both. A rule file's leading comment is the
  _module_ doc, so the `export const` beneath it still needs its own one-liner.
  `deno task doc-lint` is the check, and it runs in CI before publish.
- `license` must be set in `deno.json` (or a LICENSE file present) or
  `deno publish` fails.

### File layout

**Everything under `src/` is named in kebab-case**, so a file name is the rule
id it implements — `no-utility-types` is in `no-utility-types.ts`, documented in
`no-utility-types.md`, and no translation step sits between the diagnostic a
user sees and the file they open. Rules live under `src/<preset>/`, and each
preset directory has a `mod.ts` that is both the rule record and the published
plugin.

    src/concrete/no-utility-types.ts
    src/concrete/no-utility-types.md
    src/concrete/mod.ts
    tests/no_utility_types_test.ts

Tests keep `snake_case`, matching the `_test.ts` suffix Deno expects.

`src/mod.ts` re-exports everything for people composing their own plugin. The
layout otherwise mirrors `../deno-lint-plugin-lit`; keep the two in step, with
this file naming as the one deliberate divergence — that repo still uses
`snake_case` under `src/`.

**Entry points point straight at the preset `mod.ts`**, with no intermediate
re-export file to drift out of sync with `deno.json`.

**Rules import helpers through the `#helpers` alias**, never a relative path:

```ts
import { typeNameTail } from "#helpers";
```

The alias is declared in `deno.json` `imports` and resolves to
`src/helpers/mod.ts`, a barrel over the individual helper modules. Relative
`../../helpers/ast.ts` paths break the moment a file moves.

### Packaging: why there are two entry points

Deno's plugin API is `{ name, rules }` — **no tags, no presets, and no per-rule
options** (`RuleContext` has no `options`). `deno.json` `rules.exclude` _does_
turn off a plugin rule, but `rules.include` does **not** restrict plugin rules —
loading a plugin turns on everything in it, opt-out only.

So ESLint-style configs are impossible inside one plugin. Each preset is its own
entry point with its own plugin name, and users list the ones they want:

| Entry        | Plugin name         | Rule ids                 |
| ------------ | ------------------- | ------------------------ |
| `.`          | _(not a plugin)_    | composition surface only |
| `./concrete` | `explicit-concrete` | `explicit-concrete/…`    |
| `./naming`   | `explicit-naming`   | `explicit-naming/…`      |

```jsonc
{
  "lint": {
    "plugins": [
      "jsr:@cunarist/deno-lint-plugin-explicit-types/concrete",
      "jsr:@cunarist/deno-lint-plugin-explicit-types/naming"
    ],
    "rules": { "exclude": ["explicit-concrete/no-type-assertion"] }
  }
}
```

**Consequence — no rule takes settings.** Where memona hardcoded a project
denylist (the `EventTarget` ban in `restricted-types`), the rule is dropped
rather than shipped unconfigurable.

### Verified environment facts

Checked empirically against Deno 2.9.3 — do not re-litigate:

- AST node fields are **prototype getters**. `Object.keys(node)` returns `[]`.
  Never traverse with `Object.keys`/`Object.values` — use explicit field access.
- Top-level `export class X` arrives as an `ExportNamedDeclaration` wrapper —
  unwrap before matching `ClassDeclaration`.
- String literals are node type **`Literal`** with a `.value`, not
  `StringLiteral` — despite `StringLiteral` appearing in some key-position
  unions.
- `ClassDeclaration` has **no `decorators` field in the typings**, though it
  exists at runtime.
- `:exit` visitors (`"MethodDefinition:exit"`) work. Use them to collect facts
  during a subtree walk and decide on exit.
- There is **no cross-file resolution**. A rule that needs to follow an imported
  type can only scan `Program.body` of the same module — a real limitation to
  document per rule, not a bug.
- Comments are not visited. Reach them with
  `context.sourceCode.getAllComments()` from a `Program` visitor;
  `comment.value` excludes the leading `//`, so `trimStart()` before matching.
- `TSParameterProperty.accessibility` is **declared in the typings but never
  populated** — `constructor(private a: number)` reports `undefined`. Since
  `readonly` alone also creates a parameter property, the node's presence proves
  nothing; read the modifier tokens from the source text between the node start
  and `node.parameter.range[0]`. `PropertyDefinition`, `MethodDefinition`, and
  `AccessorProperty` do populate it correctly.
- `MethodDefinition` needs no visitor of its own. Its `value` is a
  `FunctionExpression` (or `TSEmptyBodyFunctionExpression` for an overload
  signature), and both are visited in their own right — adding one double
  reports. Conversely, a rule walking functions must include
  `TSEmptyBodyFunctionExpression` and `TSMethodSignature` or interface methods,
  abstract methods, and overload signatures slip through entirely.
- `Property` covers destructuring as well as object literals. Check
  `node.parent.type === "ObjectExpression"` to tell a declared key from a bound
  name.
- `TSTypeReference["typeName"]` is
  `Identifier | ThisExpression |
  TSQualifiedName`. There is no
  `Deno.lint.EntityName` alias — derive the type from the field itself so it
  cannot drift.

### Docs gotcha

`deno fmt` reformats `` ```ts `` blocks inside Markdown, and **silently deletes
constructs that are invalid at top level** — a decorator on a bare field, for
instance. Always wrap such examples in a `class … { }` body. In this repo the
common case is a bare `readonly` or `private` modifier: put it in a class.

### Integration testing

Unit tests use `Deno.lint.runPlugin`; that is not the deployment path. Before
release, also run real `deno lint` from a _separate_ consumer project against a
deliberately-bad file and a known-good one. On the sibling Lit plugin that check
caught two bugs 313 unit tests missed.

---

## Rule inventory

Status: `mem` = ported from memona's plugin, `std` = written in memona's
`coding-standards.md` but never enforced, `new` = neither, added here.

12 rules, two presets.

### Preset: `concrete` — write the type out

`restricted-types` was one mega-rule in memona; it is split here so each ban is
individually nameable and disableable.

| Rule                   | Src | Enforces                                                 |
| ---------------------- | --- | -------------------------------------------------------- |
| `no-utility-types`     | mem | No `Partial`/`Record`/`ReturnType`/… — 22 built-ins      |
| `no-keyof`             | mem | No `keyof` in a type position                            |
| `no-typeof-type`       | mem | No `typeof x` in a type position (`TSTypeQuery`)         |
| `no-mapped-types`      | mem | No `{ [K in T]: … }`                                     |
| `no-index-signatures`  | mem | No `{ [k: string]: … }` — use concrete fields or a `Map` |
| `no-conditional-types` | new | No `T extends U ? A : B`, no `infer`                     |
| `require-return-type`  | new | Named functions declare their return type                |
| `no-type-assertion`    | std | No `x as T` / `<T>x`; `as const` is allowed              |

### Preset: `naming` — names carry the contract

| Rule                        | Src | Enforces                                                    |
| --------------------------- | --- | ----------------------------------------------------------- |
| `pascal-case-types`         | mem | Class, interface, type alias, and enum names are PascalCase |
| `upper-snake-string-unions` | mem | String literals in a union type alias are UPPER_SNAKE_CASE  |
| `camel-case-object-keys`    | new | Object literal keys and type members are camelCase          |
| `no-enum`                   | new | No `enum` — use an UPPER_SNAKE_CASE string union            |

These three interlock. `no-enum` removes the construct;
`upper-snake-string-unions` governs the string union that replaces it; and
`camel-case-object-keys` stops those UPPER_SNAKE_CASE members from being turned
back into a lookup table — an object is a struct, so a union-keyed lookup must
be a `switch` function, which fails to compile when a member is added.

`camel-case-object-keys` is the value-level half of `no-index-signatures` and
`no-mapped-types`. It checks object literals and `TSPropertySignature`, and
deliberately skips class members (`static MAX_RETRIES = 5` is a constant),
destructuring patterns, and computed keys.

Deno's built-in `camelcase` does **not** make it redundant. Verified against
2.9.3: the built-in catches `snake_case` identifiers, object keys, and interface
members, but accepts `PENDING` as a constant and accepts any quoted key — its
own hint offers quoting as the way to silence it. Those two forms are exactly
what a map-shaped object uses.

## Where the through-line stops

Indexed access — `Config["host"]` — derives a type from another type exactly as
`keyof` does, and it is **not** banned. That is a decision, not an oversight.

The rules govern types you write. They cannot govern types someone else already
wrote, and a codebase has to name those to consume them. When a library hands
you a map-shaped field, indexed access is the only way to refer to it without
re-declaring a shape you do not own:

```ts
// a library's type, not yours
interface Options {
  retries: Record<string, number>;
}

const r: Record<string, number> = opts.retries; // no-utility-types
const r: { [k: string]: number } = opts.retries; // no-index-signatures
const r: Options["retries"] = opts.retries; // the way through
```

So the split is **authorship**: a type you declare gets written out; a type you
are handed gets reached into. Banning indexed access would leave no legal way to
name the second kind.

This package hits the same wall, which is how the gap was found. Typing a rule
record against Deno's plugin API:

| Annotation                        | Result                      |
| --------------------------------- | --------------------------- |
| `Record<string, Deno.lint.Rule>`  | `no-utility-types`          |
| `{ [k: string]: Deno.lint.Rule }` | `no-index-signatures`       |
| none                              | JSR `missing-explicit-type` |
| `Deno.lint.Plugin["rules"]`       | the only one that passes    |

All four were checked. So the line is: **named transformations** (`keyof`,
`typeof`, utility types, mapped types) are banned; picking a single field out of
a type is not. If a `no-indexed-access` rule is ever proposed, this is why it
was not written — it would close the only door out of someone else's types.

`no-unknown` was removed for the same class of reason. TypeScript allows only
`any` or `unknown` on a `catch` binding, so banning `unknown` while the README
recommends `no-explicit-any` left no way to annotate a caught error — and
`unknown` is the safer of the two, since `any` disables checking and spreads to
everything it touches.

## Ways of being implicit that are left alone

Checked against a real `deno lint` run; each is a decision, not an oversight.

- **Template literal types** — `` type Path = `FILE_${Token}` ``. Same defect as
  a mapped type: the reader has to expand it. Left out because it shows up
  almost entirely in library `.d.ts` files rather than app code, and the common
  `` `on${Capitalize<K>}` `` form already trips `no-utility-types`.
- **An exported const with no annotation** — `export const d = { retries: 3 }`.
  Note that Deno's `no-slow-types` does **not** cover this: verified that it
  needs `name`/`exports` in `deno.json` to run at all, and even then it reports
  only missing return types, not object literals. So this really is uncovered —
  it is skipped for noise, not because something else catches it.
- **A class field with no annotation** — `class E { retries = 3 }`. Rust, the
  usual comparison, does require struct field types; it infers _local
  variables_. But a field initialiser is normally one obvious line, so the "read
  the whole body" argument behind `require-return-type` does not carry over.

Confirmed closed, for the record: angle-bracket assertions, `typeof import(…)`,
and the `as const` object used as a fake enum (`typeof F[keyof typeof F]` trips
`no-typeof-type` and `no-keyof`).

## Deliberately excluded

- **The whole `disciplined` preset**, dropped after it was built: `no-readonly`,
  `no-undefined-return`, `no-default-export`, `no-namespace-import`,
  `no-parameter-destructuring`, `no-private-modifier`, `no-line-lint-ignore`.
  These are conventions about how code is arranged, not about whether a type is
  written out — a different plugin's job. The implementations, docs, and 68
  tests are **gone**: history was squashed to a single commit afterwards, so
  they survive in no branch and no clone. Wanting them back means writing them
  again from memona's `restricted-types` and `coding-standards.md`. The rule
  names above are the whole inventory; the non-obvious parts of the work are
  kept as environment facts below.
- `no-unknown` — dropped after it shipped; see above.
- `no-satisfies` — also dropped after it shipped. It was banned for leaving the
  declaration's own type inferred, and the doc claimed an annotation plus
  `as const` recovered what it offered. Checked: it does not. An annotation
  widens the declaration to the named type, so `a.typo` compiles against an
  index signature; `as const` keeps the literal shape but checks nothing. Only
  `satisfies` does both, and it writes the constraint at the site rather than
  deriving it, which is what the through-line asks for.
- The `EventTarget` ban from memona's `restricted-types` — a memona-specific
  architectural rule, and unconfigurable here.
- `no-any` and non-null-assertion bans — Deno already ships `no-explicit-any`
  and `no-non-null-assertion`. Recommend those in the README instead of
  duplicating them.
- Anything Lit-specific — that is `deno-lint-plugin-lit`'s job.

## Documentation

Every rule gets a `.md` beside it with exactly these sections:

````markdown
# rule-name

One or two sentences. Start with "Rejects …" or "Requires …".

## Why

Prose. Not a restatement of the rule — the concrete failure it prevents, then
why the alternative removes that failure structurally.

## Examples

One ```ts block containing `// BAD` then `// GOOD`. Minimal code.

## Notes

Bullets covering the edges: what it deliberately does not fire on, what variants
it does catch, what it cannot see. These double as the test list.
````

`README.md` links to each of these and never repeats them; per preset it carries
one paragraph of philosophy, one representative BAD/GOOD, and a table of
`rule → what it catches`. No contributor-facing content — library users only.
