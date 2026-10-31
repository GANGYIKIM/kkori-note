import "server-only";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const JSDOC = String.raw`\/\*\*((?:(?!\*\/)[\s\S])*)\*\/`;

/** `chat/EntryChipCard`처럼 폴더/이름으로 된 컴포넌트 목록. 미리보기 파일과 preview 폴더는 뺀다 */
const listComponentPaths = (): string[] => {
  return readdirSync(path.join(process.cwd(), "src", "components"), { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== "preview")
    .flatMap((d) =>
      readdirSync(path.join(process.cwd(), "src", "components", d.name))
        .filter((file) => file.endsWith(".tsx") && !file.endsWith(".preview.tsx"))
        .map((file) => `${d.name}/${file.slice(0, -".tsx".length)}`),
    )
    .sort();
};

/** `const 이름 =` 바로 위의 JSDoc. 없으면 파일의 첫 JSDoc */
const extractDoc = (source: string, name: string): string | null => {
  const match = source.match(new RegExp(`${JSDOC}\\s*const ${name}\\b`)) ?? source.match(new RegExp(JSDOC));
  if (!match) return null;
  return match[1]
    .split("\n")
    .map((line) => line.replace(/^\s*\* ?/, "").trimEnd())
    .join("\n")
    .trim();
};

const readComponentDocs = (): Record<string, string | null> => {
  return Object.fromEntries(
    listComponentPaths().map((p) => [
      p,
      extractDoc(readFileSync(path.join(process.cwd(), "src", "components", `${p}.tsx`), "utf8"), path.basename(p)),
    ]),
  );
};

export { extractDoc, listComponentPaths, readComponentDocs };
