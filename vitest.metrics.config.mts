import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { defineConfig } from "vitest/config";
import base from "./vitest.config.mjs";

export default defineConfig({
  ...base,
  test: {
    ...base.test,
    include: ["scripts/metrics/**/*.metrics.ts"],
    testTimeout: 15 * 60 * 1000,
    env: existsSync(".env.local") ? (parseEnv(readFileSync(".env.local", "utf8")) as Record<string, string>) : {},
  },
});
