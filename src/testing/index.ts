/**
 * Shared harness for rule tests: Oxlint's `RuleTester`, wired into Vitest.
 *
 * Imported only by `*.test.ts` files, never by a preset, so neither the tester
 * nor Vitest ends up in the published bundle.
 */

import type { Rule } from "@oxlint/plugins";
import { RuleTester } from "vite-plus/lint/plugins-dev";
import { describe, it } from "vite-plus/test";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "ts" } },
});

/**
 * Where a diagnostic should land, counted the way Oxlint's `RuleTester`
 * counts: 1-indexed lines and 0-indexed columns.
 */
export interface ReportedSpan {
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
}

/**
 * The span of the first occurrence of `text` in `code`. A rule can fire
 * correctly while highlighting the wrong characters; this is what catches that.
 */
export function spanOf(code: string, text: string): ReportedSpan {
  const start = code.indexOf(text);
  if (start === -1) throw new Error(`${JSON.stringify(text)} is not in the code`);
  const begin = position(code, start);
  const end = position(code, start + text.length);
  return {
    line: begin.line,
    column: begin.column,
    endLine: end.line,
    endColumn: end.column,
  };
}

/** A line and column within source text. */
interface Position {
  line: number;
  column: number;
}

/** The 1-indexed line and 0-indexed column of an offset. */
function position(code: string, offset: number): Position {
  const before = code.slice(0, offset).split("\n");
  return {
    line: before.length,
    column: before[before.length - 1]?.length ?? 0,
  };
}

/** Run one rule over valid and invalid snippets, as Vitest tests. */
export function testRule(name: string, rule: Rule, cases: RuleTester.TestCases): void {
  tester.run(name, rule, cases);
}
