import { defineConfig } from "vite-plus";

import { absenceConfig } from "./src/absence/index.ts";
import { concreteConfig } from "./src/concrete/index.ts";
import { namingConfig } from "./src/naming/index.ts";

export default defineConfig({
  lint: {
    // The package lints itself from source, so a new rule applies to the code
    // that implements it. Oxlint strips the types itself; no build needed.
    jsPlugins: ["./src/concrete/index.ts", "./src/naming/index.ts", "./src/absence/index.ts"],
    rules: {
      ...concreteConfig.rules,
      ...namingConfig.rules,
      ...absenceConfig.rules,
      eqeqeq: "error",
      "guard-for-in": "error",
      "no-console": "error",
      "no-eval": "error",
      "no-throw-literal": "error",
      "typescript/no-explicit-any": "error",
      "typescript/no-non-null-assertion": "error",
      "typescript/no-non-null-asserted-optional-chain": "error",
    },
    options: { typeAware: true, typeCheck: true },
  },
  pack: {
    entry: {
      concrete: "src/concrete/index.ts",
      naming: "src/naming/index.ts",
      absence: "src/absence/index.ts",
    },
    dts: true,
    fixedExtension: false,
  },
});
