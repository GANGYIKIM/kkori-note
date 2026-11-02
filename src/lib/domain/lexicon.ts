/**
 * 최소 키워드 사전 (PRD R1-4). 문장 속 표현을 종류 id와 항목 값으로 바꾼다. R8에서 넓힌다.
 * 값 id는 kinds.ts의 정의를 따른다.
 */

interface KindHit {
  kindId: string;
  index: number;
}

interface ValueHit {
  fieldId: string;
  value: string | number;
  index: number;
}

const KIND_PATTERNS: readonly { kindId: string; pattern: RegExp }[] = [
  { kindId: "poop", pattern: /배변|응가|응아|똥|대변|혈변|설사|(?:^|\s)변(?:이|을|은|도)?(?=\s|$)/ },
  { kindId: "meal", pattern: /밥|사료|식사/ },
  { kindId: "snack", pattern: /간식|개껌|트릿/ },
  { kindId: "walk", pattern: /산책/ },
  { kindId: "picked_up", pattern: /주워\s?먹|삼켰/ },
  { kindId: "limp", pattern: /절뚝|절룩/ },
  { kindId: "seizure", pattern: /발작|경련/ },
  { kindId: "thunder_fear", pattern: /천둥/ },
];

const CHOICE_PATTERNS: readonly { fieldId: string; value: string; pattern: RegExp }[] = [
  { fieldId: "stoolState", value: "hard", pattern: /딱딱|단단|토끼\s?똥/ },
  { fieldId: "stoolState", value: "normal", pattern: /정상/ },
  { fieldId: "stoolState", value: "soft", pattern: /무른|무름|물렁|흐물|묽/ },
  { fieldId: "stoolState", value: "diarrhea", pattern: /설사|물똥/ },
  { fieldId: "stoolState", value: "blood_mucus", pattern: /혈변|피똥|점액/ },
  { fieldId: "riskFood", value: "chocolate", pattern: /초콜릿|초콜렛|초코/ },
  { fieldId: "riskFood", value: "grape_raisin", pattern: /포도/ },
  { fieldId: "riskFood", value: "xylitol", pattern: /자일리톨/ },
  { fieldId: "riskFood", value: "macadamia", pattern: /마카다미아/ },
  { fieldId: "riskFood", value: "onion_garlic", pattern: /양파|마늘/ },
  { fieldId: "chocolateType", value: "dark", pattern: /다크/ },
  { fieldId: "chocolateType", value: "milk", pattern: /밀크/ },
  { fieldId: "chocolateType", value: "white", pattern: /화이트/ },
  { fieldId: "chocolateType", value: "baking", pattern: /베이킹/ },
  { fieldId: "intensity", value: "high", pattern: /심하|심했|심각/ },
  { fieldId: "intensity", value: "low", pattern: /살짝|약하게/ },
];

const NUMBER_PATTERNS: readonly { fieldId: string; pattern: RegExp }[] = [
  { fieldId: "count", pattern: /(\d+)\s*(?:회|번)/ },
  { fieldId: "amountG", pattern: /(\d+)\s*(?:g|그램)/i },
];

const EATING = /먹/;

/** 이름 뒤에 붙으면 그 이름을 강아지로 보는 조사. 긴 것부터 맞춘다 (PRD R1-10) */
const DOG_PARTICLES = ["이랑", "하고", "가", "이", "는", "은", "도", "랑", "와", "의"] as const;

const findValues = (text: string): ValueHit[] => {
  const hits: ValueHit[] = [];
  for (const { fieldId, value, pattern } of CHOICE_PATTERNS) {
    const match = pattern.exec(text);
    if (match) hits.push({ fieldId, value, index: match.index });
  }
  for (const { fieldId, pattern } of NUMBER_PATTERNS) {
    const match = pattern.exec(text);
    if (match) hits.push({ fieldId, value: Number(match[1]), index: match.index });
  }
  return hits;
};

/** 찾은 종류를 문장에 처음 나온 순서대로. 위험 음식과 "먹"이 함께 있으면 주워 먹음이다 */
const findKinds = (text: string): KindHit[] => {
  const hits: KindHit[] = [];
  for (const { kindId, pattern } of KIND_PATTERNS) {
    const match = pattern.exec(text);
    if (match) hits.push({ kindId, index: match.index });
  }
  const riskFood = findValues(text).find((v) => v.fieldId === "riskFood");
  if (riskFood && EATING.test(text) && !hits.some((h) => h.kindId === "picked_up")) {
    hits.push({ kindId: "picked_up", index: riskFood.index });
  }
  return hits.sort((a, b) => a.index - b.index);
};

const overlapsLexicon = (word: string): boolean => {
  return findKinds(word).length > 0 || findValues(word).length > 0;
};

export { findKinds, findValues, overlapsLexicon, DOG_PARTICLES };
export type { KindHit, ValueHit };
