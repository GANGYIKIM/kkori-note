import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// PRD, R 문서, 테스트가 서로 어긋나지 않게 막는다 (ADR-0011).

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const PRD_DIR = join(ROOT, "docs/prd");
const DEV_LOG_DIR = join(ROOT, "docs/dev-log");
const THIS_FILE = fileURLToPath(import.meta.url);

interface SubRequirement {
  id: string;
  acceptance: string[];
  checked: string[];
  confirmedElsewhere: boolean;
  misplaced: string[];
}

const read = (path: string) => readFileSync(path, "utf8");

const sectionLines = (markdown: string, heading: string) => {
  const lines = markdown.split("\n");
  const start = lines.findIndex((line) => line.trim() === heading);
  if (start === -1) return [];
  const end = lines.findIndex((line, i) => i > start && line.startsWith("## "));
  return lines.slice(start + 1, end === -1 ? undefined : end);
};

const parseRequirements = (markdown: string, r: string) => {
  const lines = sectionLines(markdown, "## 요구사항 (P1)");
  const subPattern = new RegExp(`^- \\*\\*(${r}-\\d+) `);
  const numbered = lines.some((line) => subPattern.test(line));
  const subs: SubRequirement[] = [];
  const stray: string[] = [];
  for (const line of lines) {
    const sub = subPattern.exec(line);
    if (sub) {
      subs.push({ id: sub[1], acceptance: [], checked: [], confirmedElsewhere: false, misplaced: [] });
      continue;
    }
    if (line.startsWith("- ")) {
      stray.push(line);
      continue;
    }
    const current = subs.at(-1);
    const ac = /^\s+- \[( |x)\] (R\d+-\d+\.\d+) /.exec(line);
    if (ac && current) {
      if (!ac[2].startsWith(`${current.id}.`)) current.misplaced.push(ac[2]);
      current.acceptance.push(ac[2]);
      if (ac[1] === "x") current.checked.push(ac[2]);
    } else if (/^\s+- 확인: R\d+/.test(line) && current) {
      current.confirmedElsewhere = true;
    }
  }
  return { numbered, subs, stray };
};

const tableIds = (markdown: string, heading: string, pattern: RegExp) =>
  sectionLines(markdown, heading)
    .map((line) => pattern.exec(line)?.[1])
    .filter((id): id is string => id !== undefined);

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "node_modules" ? [] : walk(path);
    return [path];
  });

const index = read(join(ROOT, "docs/PRD.md"))
  .split("\n")
  .map((line) => /^\| (R\d+) \| .+? \| P\d \| `prd\/([^`]+)` \|\s*(.*?)\s*\|$/.exec(line))
  .filter((match) => match !== null)
  .map(([, r, file, openQuestion]) => ({ r, file, openQuestion: openQuestion.trim() }));

const prdFiles = readdirSync(PRD_DIR).filter((name) => /^R\d+\.md$/.test(name));

const requirements = prdFiles.map((file) => {
  const r = file.replace(".md", "");
  return { r, ...parseRequirements(read(join(PRD_DIR, file)), r) };
});
const numbered = requirements.filter((req) => req.numbered);

const testSources = [...walk(join(ROOT, "src")), ...walk(join(ROOT, "tests"))]
  .filter((path) => /\.test\.tsx?$/.test(path) && path !== THIS_FILE)
  .map(read)
  .join("\n");
const manualChecks = walk(DEV_LOG_DIR)
  .filter((path) => path.endsWith(".md"))
  .flatMap((path) => read(path).split("\n"))
  .filter((line) => line.includes("수동 확인:"))
  .join("\n");

const mentions = (text: string, id: string) => new RegExp(`${id.replace(".", "\\.")}(?![\\d.])`).test(text);

describe("parseRequirements", () => {
  const sample = [
    "## 요구사항 (P1)",
    "",
    "머리말은 번호가 없어도 된다.",
    "",
    "- **R9-1 첫째**: 동작",
    "  - 수락 기준",
    "    - [x] R9-1.1 확인한 기준",
    "- **R9-2 둘째**: 수락 기준이 없다",
    "- 번호 없는 줄",
    "- **R9-3 셋째**: 다른 R에서 확인",
    "  - 확인: R8",
    "  - 수락 기준",
    "    - [ ] R9-1.2 다른 하위 요구사항의 번호",
    "",
    "## 나중에",
    "- 번호 없는 줄이어도 세지 않는다",
  ].join("\n");
  const parsed = parseRequirements(sample, "R9");

  it("번호가 붙은 R로 알아본다", () => {
    expect(parsed.numbered).toBe(true);
    expect(parsed.subs.map((s) => s.id)).toEqual(["R9-1", "R9-2", "R9-3"]);
  });

  it("번호 없는 맨 앞 줄을 찾는다", () => {
    expect(parsed.stray).toEqual(["- 번호 없는 줄"]);
  });

  it("수락 기준, 체크, 다른 R 확인, 잘못 놓인 번호를 읽는다", () => {
    expect(parsed.subs[0]).toMatchObject({ acceptance: ["R9-1.1"], checked: ["R9-1.1"] });
    expect(parsed.subs[1]).toMatchObject({ acceptance: [], confirmedElsewhere: false });
    expect(parsed.subs[2]).toMatchObject({ confirmedElsewhere: true, misplaced: ["R9-1.2"] });
  });
});

describe("PRD 색인과 R 파일", () => {
  it("색인을 읽는다", () => {
    expect(index.length).toBeGreaterThan(0);
  });

  it.each(index)("$r 의 파일은 prd/$r.md 이고 실제로 있다", ({ r, file }) => {
    expect(file).toBe(`${r}.md`);
    expect(existsSync(join(PRD_DIR, file))).toBe(true);
  });

  it.each(prdFiles)("%s 가 색인에 있다", (file) => {
    expect(index.map((row) => row.file)).toContain(file);
  });
});

describe("열린 질문", () => {
  const blocked = read(join(PRD_DIR, "open-questions.md"))
    .split("\n")
    .filter((line) => line.startsWith("| ") && !line.startsWith("| 질문"))
    .flatMap((line) => [...(line.split("|")[2] ?? "").matchAll(/R(\d+)(?!\d)/g)].map((m) => `R${m[1]}`));

  it("열린 질문 표를 읽는다", () => {
    expect(blocked.length).toBeGreaterThan(0);
  });

  it.each([...new Set(blocked)])("%s 는 색인의 열린 질문 칸이 채워져 있다", (r) => {
    expect(index.find((row) => row.r === r)?.openQuestion).toBeTruthy();
  });
});

describe("번호가 붙은 R", () => {
  it("검사할 R이 있다", () => {
    expect(numbered.length).toBeGreaterThan(0);
  });

  describe.each(numbered)("$r", ({ r, subs, stray }) => {
    it("요구사항의 맨 앞 줄은 모두 하위 요구사항 번호로 시작한다", () => {
      expect(stray).toEqual([]);
    });

    it("하위 요구사항 번호가 겹치지 않는다", () => {
      expect(new Set(subs.map((s) => s.id)).size).toBe(subs.length);
    });

    it.each(subs)("$id 는 수락 기준이나 다른 R 확인이 있고, 수락 기준 번호가 맞다", (sub) => {
      expect(sub.acceptance.length > 0 || sub.confirmedElsewhere).toBe(true);
      expect(sub.misplaced).toEqual([]);
    });

    const rDoc = join(DEV_LOG_DIR, r, "README.md");
    it.skipIf(!existsSync(rDoc))("R 문서의 요구사항별 개발 표가 하위 요구사항과 같다", () => {
      const ids = tableIds(read(rDoc), "## 요구사항별 개발", /^\| (R\d+-\d+) /);
      expect([...ids].sort()).toEqual(subs.map((s) => s.id).sort());
    });

    const checked = subs.flatMap((s) => s.checked);
    it.skipIf(checked.length === 0).each(checked)("체크된 %s 는 테스트 이름이나 수동 확인에 있다", (id) => {
      expect(mentions(testSources, id) || mentions(manualChecks, id), `${id}: ${relative(ROOT, rDoc)}`).toBe(true);
    });
  });
});
