import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const API_DIR = fileURLToPath(new URL(".", import.meta.url));

function findRouteFiles(): string[] {
  return readdirSync(API_DIR, { recursive: true, encoding: "utf8" })
    .filter((path) => path.endsWith("route.ts"));
}

// src/app/api/의 라우트는 모두 LLM을 호출하므로, 호출 전에 guardLlmRequest를 거쳐야 한다 (PRD R9).
describe("API 라우트의 요청 제한", () => {
  const routes = findRouteFiles();

  it("검사할 라우트를 찾는다", () => {
    expect(routes.length).toBeGreaterThan(0);
  });

  it.each(routes)("%s 는 guardLlmRequest를 부른다", (file) => {
    expect(readFileSync(join(API_DIR, file), "utf8")).toMatch(/guardLlmRequest\(/);
  });
});
