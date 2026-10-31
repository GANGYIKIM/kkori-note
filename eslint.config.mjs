import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";

const noBarrel = [
  {
    selector: "ExportAllDeclaration",
    message: "배럴 파일을 만들지 않아요. 쓰는 쪽에서 원본 파일을 직접 import해 주세요.",
  },
  {
    selector: "ExportNamedDeclaration[source]",
    message: "배럴 파일을 만들지 않아요. 쓰는 쪽에서 원본 파일을 직접 import해 주세요.",
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Tailwind 클래스: 실제 버그는 error, 자동 수정되는 고칠 거리는 warn. 순서·줄바꿈은 Prettier가 맡는다.
  {
    plugins: { "better-tailwindcss": betterTailwindcss },
    settings: {
      "better-tailwindcss": { entryPoint: "src/app/globals.css" },
    },
    rules: {
      "better-tailwindcss/no-unknown-classes": "error",
      "better-tailwindcss/no-conflicting-classes": "error",
      "better-tailwindcss/enforce-canonical-classes": "warn",
      "better-tailwindcss/no-deprecated-classes": "warn",
      "better-tailwindcss/no-duplicate-classes": "warn",
    },
  },
  {
    rules: {
      "no-restricted-syntax": ["error", ...noBarrel],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*"],
              message: "상위 폴더는 @/ 별칭으로 import해 주세요. 같은 폴더 안만 ./를 써요.",
            },
          ],
        },
      ],
    },
  },
  // 함수는 const 화살표 함수, export는 파일 맨 아래에 모은다. src/app의 Next 파일은 예외 (ADR-0008)
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/app/**"],
    rules: {
      "func-style": ["error", "expression"],
      "react/function-component-definition": [
        "error",
        { namedComponents: "arrow-function", unnamedComponents: "arrow-function" },
      ],
      "no-restricted-syntax": [
        "error",
        ...noBarrel,
        {
          selector: "ExportNamedDeclaration[declaration]",
          message: "export는 파일 맨 아래 export { } 한 곳에 모아 주세요.",
        },
      ],
      "import/exports-last": "error",
      "import/group-exports": "error",
    },
  },
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
