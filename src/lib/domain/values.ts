/**
 * 기록 종류와 무관한 값 목록(enum). 기록 종류·항목·값 목록은 kinds.ts에 있다 (ADR-0012).
 */

/** 날씨 (P2 수동 입력, P4 자동 연동). 데이터 모델에는 P1부터 선택 필드로 포함 */
const WEATHERS = ["sunny", "cloudy", "rain", "snow", "thunder", "heat", "cold"] as const;
type Weather = (typeof WEATHERS)[number];

/** 시각의 정확도. day는 시각 없이 그날 하루 전체의 기록이다 (ADR-0012) */
const TIME_PRECISIONS = ["exact", "estimated", "day"] as const;
type TimePrecision = (typeof TIME_PRECISIONS)[number];

/** 위험 등급. 코드(assess)가 결정하고 모드와 무관하다 (PRD R6) */
const RISK_GRADES = ["high", "caution", "low"] as const;
type RiskGrade = (typeof RISK_GRADES)[number];

/** 상담 태도 모드 */
const MODES = ["overprotective", "neutral", "easygoing"] as const;
type Mode = (typeof MODES)[number];
const DEFAULT_MODE: Mode = "neutral";

type KindStyle = { tag: string; dot: string };

/** 기록 종류별 색. tag는 글자와 10% 배경, dot은 점. Tailwind가 클래스를 찾을 수 있게 전체 클래스명을 그대로 적는다 */
const KIND_STYLES: Record<string, KindStyle> = {
  poop: { tag: "bg-kind-poop/10 text-kind-poop", dot: "bg-kind-poop" },
  meal: { tag: "bg-kind-meal/10 text-kind-meal", dot: "bg-kind-meal" },
  snack: { tag: "bg-kind-snack/10 text-kind-snack", dot: "bg-kind-snack" },
  walk: { tag: "bg-kind-walk/10 text-kind-walk", dot: "bg-kind-walk" },
  picked_up: { tag: "bg-kind-picked-up/10 text-kind-picked-up", dot: "bg-kind-picked-up" },
  limp: { tag: "bg-kind-limp/10 text-kind-limp", dot: "bg-kind-limp" },
  seizure: { tag: "bg-kind-seizure/10 text-kind-seizure", dot: "bg-kind-seizure" },
  thunder_fear: { tag: "bg-kind-thunder/10 text-kind-thunder", dot: "bg-kind-thunder" },
  note: { tag: "bg-kind-note/10 text-kind-note", dot: "bg-kind-note" },
};

const kindStyle = (kindId: string): KindStyle => {
  return KIND_STYLES[kindId] ?? KIND_STYLES.note;
};

/** 화면에 보여줄 한글 라벨 */
const LABELS = {
  weather: {
    sunny: "맑음",
    cloudy: "흐림",
    rain: "비",
    snow: "눈",
    thunder: "천둥·번개",
    heat: "폭염",
    cold: "한파",
  },
  riskGrade: { high: "고위험", caution: "경계", low: "저위험" },
  mode: { overprotective: "과보호", neutral: "중립", easygoing: "무던" },
} as const satisfies {
  weather: Record<Weather, string>;
  riskGrade: Record<RiskGrade, string>;
  mode: Record<Mode, string>;
};

export { WEATHERS, TIME_PRECISIONS, RISK_GRADES, MODES, DEFAULT_MODE, KIND_STYLES, kindStyle, LABELS };
export type { Weather, TimePrecision, RiskGrade, Mode, KindStyle };
