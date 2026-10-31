import { describe, expect, it } from "vitest";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const COMPONENTS_DIR = fileURLToPath(new URL("../src/components/", import.meta.url));
const FOLDERS = ["layout", "common", "entry", "chat", "main", "settings", "preview"];
const FIX_HINT =
  ".claude/rules/frontend.md의 '컴포넌트 폴더' 표에서 맞는 폴더로 옮겨 주세요. 새 도메인 폴더가 꼭 필요하면 FOLDERS와 그 표에 함께 추가해요.";

describe("src/components 폴더", () => {
  const entries = readdirSync(COMPONENTS_DIR, { withFileTypes: true });

  it("맨 위에 파일을 두지 않는다", () => {
    const files = entries.filter((e) => e.isFile()).map((e) => e.name);
    expect(files, FIX_HINT).toEqual([]);
  });

  it("정해진 폴더만 쓴다", () => {
    const unknown = entries.filter((e) => e.isDirectory() && !FOLDERS.includes(e.name)).map((e) => e.name);
    expect(unknown, FIX_HINT).toEqual([]);
  });
});
