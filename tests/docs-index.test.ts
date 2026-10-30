import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DOCS_DIR = fileURLToPath(new URL("../docs/", import.meta.url));
const isIndexed = (name: string) => name.endsWith(".md") && name !== "README.md" && !name.startsWith("TEMPLATE");
const R_FOLDER = /^R\d+$/;

function linksIn(dir: string) {
  const index = readFileSync(join(dir, "README.md"), "utf8");
  return [...index.matchAll(/\]\(([^)]+\.md)\)/g)].map((match) => match[1]);
}

// ADR과 dev-log는 README.md 색인으로 찾으므로, 색인이 실제 파일과 어긋나면 안 된다 (ADR-0004).
// dev-log는 R 폴더마다 R 문서(README.md)가 하위 문서의 색인이다 (ADR-0006).
describe.each(["adr", "dev-log"])("docs/%s 색인", (folder) => {
  const dir = join(DOCS_DIR, folder);
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile() && isIndexed(e.name)).map((e) => e.name);
  const rDocs = entries.filter((e) => e.isDirectory() && R_FOLDER.test(e.name)).map((e) => `${e.name}/README.md`);
  const links = linksIn(dir);

  it("검사할 문서를 찾는다", () => {
    expect(files.length + rDocs.length).toBeGreaterThan(0);
  });

  it.each([...files, ...rDocs])("%s 가 색인에 있다", (file) => {
    expect(links).toContain(file);
  });

  it.each(links)("색인의 %s 가 실제로 있다", (link) => {
    expect(existsSync(join(dir, link))).toBe(true);
  });
});

const rFolders = readdirSync(join(DOCS_DIR, "dev-log"), { withFileTypes: true })
  .filter((e) => e.isDirectory() && R_FOLDER.test(e.name))
  .map((e) => e.name);

describe.skipIf(rFolders.length === 0).each(rFolders)("docs/dev-log/%s 하위 문서", (folder) => {
  const dir = join(DOCS_DIR, "dev-log", folder);
  const files = readdirSync(dir).filter(isIndexed);
  const links = linksIn(dir);

  it.each(files)("%s 가 R 문서에 링크돼 있다", (file) => {
    expect(links).toContain(file);
  });

  it.each(links)("R 문서의 %s 가 실제로 있다", (link) => {
    expect(existsSync(join(dir, link))).toBe(true);
  });
});
