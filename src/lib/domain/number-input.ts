import type { FieldDef } from "./kinds";

/** 숫자 입력칸의 규칙. 최대가 없으면 max는 Infinity, 정수면 decimals는 0 */
interface NumberRule {
  min: number;
  max: number;
  integer: boolean;
  decimals: number;
}

type NumberField = Extract<FieldDef, { type: "number" }>;

const ruleFromField = (field: NumberField): NumberRule => ({
  min: field.min,
  max: field.max,
  integer: field.integer,
  decimals: field.integer ? 0 : 1,
});

/**
 * 칠 때마다 입력 글자를 규칙대로 거른다. 최대값을 넘으면 null을 돌려주고, 부르는 쪽은 직전 글자를 그대로 둔다.
 * 최소값은 여기서 보지 않는다. 0.5를 치는 도중의 0을 막지 않기 위해서다 (commitNumberText에서 맞춘다)
 */
const sanitizeNumberText = (text: string, rule: NumberRule): string | null => {
  let cleaned = text.replace(/,/g, ".").replace(/[^\d.]/g, "");
  if (rule.integer || rule.decimals === 0) {
    cleaned = cleaned.split(".")[0];
  } else {
    const dot = cleaned.indexOf(".");
    if (dot !== -1) {
      cleaned =
        cleaned.slice(0, dot + 1) +
        cleaned
          .slice(dot + 1)
          .replace(/\./g, "")
          .slice(0, rule.decimals);
    }
  }
  cleaned = cleaned.replace(/^0+(?=\d)/, "");
  if (cleaned.startsWith(".")) cleaned = `0${cleaned}`;
  if (cleaned !== "" && Number(cleaned) > rule.max) return null;
  return cleaned;
};

/** 칸을 벗어날 때 숫자로 확정한다. 빈칸은 null(모름), 최소값보다 작으면 최소값 */
const commitNumberText = (text: string, rule: NumberRule): number | null => {
  const trimmed = text.trim();
  if (trimmed === "") return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return null;
  return Math.max(rule.min, value);
};

/** 빈칸의 자리 표시로 보여줄 범위 */
const rangeHint = (rule: NumberRule): string => {
  return Number.isFinite(rule.max) ? `${rule.min}~${rule.max}` : `${rule.min} 이상`;
};

export { ruleFromField, sanitizeNumberText, commitNumberText, rangeHint };
export type { NumberRule };
