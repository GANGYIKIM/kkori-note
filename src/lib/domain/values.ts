/**
 * 값 목록(enum) — 칩 UI, Zod 스키마, 집계 함수가 모두 이 파일을 참조한다.
 * 새 값을 추가할 때는 여기만 고치면 된다. (PRD R8)
 */

/** 기록 종류 */
const ENTRY_KINDS = [
  "poop", // 배변
  "meal", // 식사
  "snack", // 간식
  "walk", // 산책
  "picked_up", // 주워 먹은 것
  "limp", // 절뚝임 (에피소드)
  "seizure", // 발작 (에피소드)
  "thunder_fear", // 천둥 떨림 (에피소드)
  "note", // 기타 메모
] as const;
type EntryKind = (typeof ENTRY_KINDS)[number];

/** 시작과 끝이 있는 에피소드 종류 */
const EPISODE_KINDS = ["limp", "seizure", "thunder_fear"] as const satisfies readonly EntryKind[];
type EpisodeKind = (typeof EPISODE_KINDS)[number];

const isEpisodeKind = (kind: EntryKind): kind is EpisodeKind => {
  return (EPISODE_KINDS as readonly string[]).includes(kind);
};

/** 배변 상태. 세분화 여부는 수의학 출처 확인 후 결정 (PRD 열린 질문) */
const STOOL_STATES = ["hard", "normal", "soft", "diarrhea", "blood_mucus", "other"] as const;
type StoolState = (typeof STOOL_STATES)[number];

/** 강도 (천둥 떨림 등) */
const INTENSITIES = ["low", "medium", "high"] as const;
type Intensity = (typeof INTENSITIES)[number];

/** 날씨 (P2 수동 입력, P4 자동 연동). 데이터 모델에는 P1부터 선택 필드로 포함 */
const WEATHERS = ["sunny", "cloudy", "rain", "snow", "thunder", "heat", "cold"] as const;
type Weather = (typeof WEATHERS)[number];

/** 위험 음식 (PRD R6). 임계값은 docs/research/에서 출처 확인 후 확정 */
const RISK_FOODS = ["chocolate", "grape_raisin", "xylitol", "macadamia", "onion_garlic"] as const;
type RiskFood = (typeof RISK_FOODS)[number];

/** 초콜릿 종류. 종류마다 메틸잔틴 함량이 달라 위험도 계산에 쓴다 */
const CHOCOLATE_TYPES = ["white", "milk", "dark", "baking", "unknown"] as const;
type ChocolateType = (typeof CHOCOLATE_TYPES)[number];

/** 위험 등급. 코드(assess)가 결정하고 모드와 무관하다 (PRD R6) */
const RISK_GRADES = ["high", "caution", "low"] as const;
type RiskGrade = (typeof RISK_GRADES)[number];

/** 상담 태도 모드 */
const MODES = ["overprotective", "neutral", "easygoing"] as const;
type Mode = (typeof MODES)[number];
const DEFAULT_MODE: Mode = "neutral";

/** 화면에 보여줄 한글 라벨 */
const LABELS = {
  entryKind: {
    poop: "배변",
    meal: "식사",
    snack: "간식",
    walk: "산책",
    picked_up: "주워 먹음",
    limp: "절뚝임",
    seizure: "발작",
    thunder_fear: "천둥 떨림",
    note: "메모",
  },
  stoolState: {
    hard: "딱딱함",
    normal: "정상",
    soft: "무름",
    diarrhea: "설사",
    blood_mucus: "혈변·점액",
    other: "기타",
  },
  intensity: { low: "약", medium: "중", high: "강" },
  weather: {
    sunny: "맑음",
    cloudy: "흐림",
    rain: "비",
    snow: "눈",
    thunder: "천둥·번개",
    heat: "폭염",
    cold: "한파",
  },
  riskFood: {
    chocolate: "초콜릿",
    grape_raisin: "포도·건포도",
    xylitol: "자일리톨",
    macadamia: "마카다미아",
    onion_garlic: "양파·마늘",
  },
  chocolateType: { white: "화이트", milk: "밀크", dark: "다크", baking: "베이킹용", unknown: "종류 모름" },
  riskGrade: { high: "고위험", caution: "경계", low: "저위험" },
  mode: { overprotective: "과보호", neutral: "중립", easygoing: "무던" },
} as const satisfies {
  entryKind: Record<EntryKind, string>;
  stoolState: Record<StoolState, string>;
  intensity: Record<Intensity, string>;
  weather: Record<Weather, string>;
  riskFood: Record<RiskFood, string>;
  chocolateType: Record<ChocolateType, string>;
  riskGrade: Record<RiskGrade, string>;
  mode: Record<Mode, string>;
};

export {
  ENTRY_KINDS,
  EPISODE_KINDS,
  isEpisodeKind,
  STOOL_STATES,
  INTENSITIES,
  WEATHERS,
  RISK_FOODS,
  CHOCOLATE_TYPES,
  RISK_GRADES,
  MODES,
  DEFAULT_MODE,
  LABELS,
};
export type { EntryKind, EpisodeKind, StoolState, Intensity, Weather, RiskFood, ChocolateType, RiskGrade, Mode };
