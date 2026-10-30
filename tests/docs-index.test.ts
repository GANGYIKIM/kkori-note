import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DOCS_DIR = fileURLToPath(new URL("../docs/", import.meta.url));
const NOT_INDEXED = ["README.md", "TEMPLATE.md"];

// ADR과 dev-log는 README.md 색인으로 찾으므로, 색인이 실제 파일과 어긋나면 안 된다 (ADR-0004).
describe.each(["adr", "dev-log"])("docs/%s 색인", (folder) => {
  const dir = join(DOCS_DIR, folder);
  const index = readFileSync(join(dir, "README.md"), "utf8");
  const files = readdirSync(dir).filter((name) => name.endsWith(".md") && !NOT_INDEXED.includes(name));
  const links = [...index.matchAll(/\]\(([^)]+\.md)\)/g)].map((match) => match[1]);

  it("검사할 문서를 찾는다", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)("%s 가 색인에 있다", (file) => {
    expect(links).toContain(file);
  });

  it.each(links)("색인의 %s 가 실제로 있다", (link) => {
    expect(existsSync(join(dir, link))).toBe(true);
  });
});
