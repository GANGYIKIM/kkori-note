import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { CATALOG } from "@/components/preview/catalog";
import { extractDoc, listComponentPaths } from "@/components/preview/component-docs";

const FIX_HINT = "컴포넌트 옆에 X.preview.tsx를 만들고 src/components/preview/catalog.ts에 등록해 주세요 (ADR-0010).";

describe("/preview 카탈로그", () => {
  const paths = listComponentPaths();

  it("컴포넌트마다 옆에 X.preview.tsx가 있다", () => {
    const missing = paths.filter((p) => !existsSync(`src/components/${p}.preview.tsx`));
    expect(missing, FIX_HINT).toEqual([]);
  });

  it("모든 컴포넌트가 catalog.ts에 등록돼 있다", () => {
    expect(Object.keys(CATALOG).sort(), FIX_HINT).toEqual(paths);
  });
});

describe("extractDoc", () => {
  it("컴포넌트 바로 위의 JSDoc을 고른다", () => {
    const source = `/** 도우미 */\nconst helper = () => 1;\n\n/**\n * 카드.\n * 쓸 때: 목록\n */\nconst Card = () => null;`;
    expect(extractDoc(source, "Card")).toBe("카드.\n쓸 때: 목록");
  });

  it("컴포넌트 위에 없으면 파일의 첫 JSDoc을 쓴다", () => {
    expect(extractDoc(`/** 아이콘 모음 */\n\nconst Icon = () => null;`, "Icons")).toBe("아이콘 모음");
  });

  it("JSDoc이 없으면 null", () => {
    expect(extractDoc("const Form = () => null;", "Form")).toBeNull();
  });
});
