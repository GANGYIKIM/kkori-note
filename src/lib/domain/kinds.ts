/**
 * 기록 종류 정의. 기록은 종류 id와 항목 값(id)만 저장하고, 라벨과 값 목록은 여기서 읽는다 (ADR-0012).
 * 종류 편집(R11 P2)이 생기면 사용자 정의(DB)를 이 기본 정의와 합친다.
 */

interface Option {
  id: string;
  label: string;
}

interface FieldBase {
  id: string;
  label: string;
  /** 위험 판단(R6)과 집계(R4)가 읽는 항목. 편집 기능이 생겨도 지울 수 없다 */
  system: boolean;
}

type FieldDef =
  | (FieldBase & { type: "choice"; options: Option[] })
  | (FieldBase & { type: "number"; min: number; max: number; integer: boolean; unit: string })
  | (FieldBase & { type: "text"; maxLength: number });

interface KindDef {
  id: string;
  label: string;
  /** 시작과 끝이 있는 에피소드 종류 */
  episode: boolean;
  system: boolean;
  fields: FieldDef[];
}

type EntryValues = Record<string, string | number>;

const detail: FieldDef = { id: "detail", label: "내용", type: "text", maxLength: 200, system: false };

const intensity: FieldDef = {
  id: "intensity",
  label: "강도",
  type: "choice",
  system: true,
  options: [
    { id: "low", label: "약" },
    { id: "medium", label: "중" },
    { id: "high", label: "강" },
  ],
};

const DEFAULT_KINDS: readonly KindDef[] = [
  {
    id: "poop",
    label: "배변",
    episode: false,
    system: true,
    fields: [
      {
        id: "stoolState",
        label: "상태",
        type: "choice",
        system: true,
        options: [
          { id: "hard", label: "딱딱함" },
          { id: "normal", label: "정상" },
          { id: "soft", label: "무름" },
          { id: "diarrhea", label: "설사" },
          { id: "blood_mucus", label: "혈변·점액" },
          { id: "other", label: "기타" },
        ],
      },
      { id: "count", label: "횟수", type: "number", min: 1, max: 10, integer: true, unit: "회", system: true },
      detail,
    ],
  },
  { id: "meal", label: "식사", episode: false, system: true, fields: [detail] },
  { id: "snack", label: "간식", episode: false, system: true, fields: [detail] },
  { id: "walk", label: "산책", episode: false, system: true, fields: [detail] },
  {
    id: "picked_up",
    label: "주워 먹음",
    episode: false,
    system: true,
    fields: [
      {
        id: "riskFood",
        label: "위험 음식",
        type: "choice",
        system: true,
        options: [
          { id: "chocolate", label: "초콜릿" },
          { id: "grape_raisin", label: "포도·건포도" },
          { id: "xylitol", label: "자일리톨" },
          { id: "macadamia", label: "마카다미아" },
          { id: "onion_garlic", label: "양파·마늘" },
        ],
      },
      {
        id: "chocolateType",
        label: "초콜릿 종류",
        type: "choice",
        system: true,
        options: [
          { id: "white", label: "화이트" },
          { id: "milk", label: "밀크" },
          { id: "dark", label: "다크" },
          { id: "baking", label: "베이킹용" },
          { id: "unknown", label: "종류 모름" },
        ],
      },
      { id: "amountG", label: "먹은 양", type: "number", min: 0, max: 5000, integer: true, unit: "g", system: true },
      detail,
    ],
  },
  { id: "limp", label: "절뚝임", episode: true, system: true, fields: [intensity, detail] },
  { id: "seizure", label: "발작", episode: true, system: true, fields: [intensity, detail] },
  { id: "thunder_fear", label: "천둥 떨림", episode: true, system: true, fields: [intensity, detail] },
  { id: "note", label: "메모", episode: false, system: true, fields: [detail] },
];

const findKind = (kindId: string): KindDef | null => {
  return DEFAULT_KINDS.find((k) => k.id === kindId) ?? null;
};

const kindLabel = (kindId: string): string => {
  return findKind(kindId)?.label ?? kindId;
};

const isEpisodeKind = (kindId: string): boolean => {
  return findKind(kindId)?.episode ?? false;
};

const findField = (kind: KindDef | null, fieldId: string): FieldDef | null => {
  return kind?.fields.find((f) => f.id === fieldId) ?? null;
};

const fieldLabel = (kind: KindDef | null, fieldId: string): string => {
  return findField(kind, fieldId)?.label ?? fieldId;
};

const optionLabel = (kind: KindDef | null, fieldId: string, optionId: string): string => {
  const field = findField(kind, fieldId);
  if (field?.type !== "choice") return optionId;
  return field.options.find((o) => o.id === optionId)?.label ?? optionId;
};

const isValidValue = (field: FieldDef, value: string | number): boolean => {
  switch (field.type) {
    case "choice":
      return typeof value === "string" && field.options.some((o) => o.id === value);
    case "number":
      return (
        typeof value === "number" &&
        value >= field.min &&
        value <= field.max &&
        (!field.integer || Number.isInteger(value))
      );
    case "text":
      return typeof value === "string" && value.length <= field.maxLength;
  }
};

/** 새로 저장하기 전에 정의로 값을 검사한다. 저장된 기록을 읽을 때는 쓰지 않는다 (ADR-0012) */
const checkValues = (
  kind: KindDef,
  values: EntryValues,
): { ok: true; values: EntryValues } | { ok: false; invalidFieldIds: string[] } => {
  const invalidFieldIds = Object.entries(values)
    .filter(([fieldId, value]) => {
      const field = findField(kind, fieldId);
      return field === null || !isValidValue(field, value);
    })
    .map(([fieldId]) => fieldId);
  return invalidFieldIds.length === 0 ? { ok: true, values } : { ok: false, invalidFieldIds };
};

export { DEFAULT_KINDS, findKind, kindLabel, isEpisodeKind, findField, fieldLabel, optionLabel, checkValues };
export type { KindDef, FieldDef, Option, EntryValues };
