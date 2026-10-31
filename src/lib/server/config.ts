import "server-only";

/** 서버 설정. 값은 환경변수로 바꿀 수 있고, 기본값은 데모용으로 보수적이다. (PRD R9) */

const intFromEnv = (name: string, fallback: number): number => {
  const raw = process.env[name];
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/** 추론 강도. 기본값이 medium인 모델이 많아 비용·지연이 늘 수 있어 명시적으로 지정한다. (ADR-0001) */
const REASONING_EFFORTS = ["none", "low", "medium", "high"] as const;
type ReasoningEffort = (typeof REASONING_EFFORTS)[number];

/** 허용 목록에 없는 값은 무시하고 기본값을 쓴다. */
const parseReasoningEffort = (raw: string | undefined, fallback: ReasoningEffort): ReasoningEffort => {
  const value = raw?.trim().toLowerCase();
  return (REASONING_EFFORTS as readonly string[]).includes(value ?? "") ? (value as ReasoningEffort) : fallback;
};

/** LLM 호출 목적. 목적별로 모델과 추론 강도를 따로 둔다. */
type LlmPurpose = "parse" | "consult";

const serverConfig = {
  /** IP(또는 브라우저)당 하루 LLM 호출 허용 횟수 */
  dailyLimitPerClient: intFromEnv("RATE_LIMIT_DAILY_PER_CLIENT", 30),
  /** 서버 전체 하루 LLM 호출 상한 (여러 IP로 분산 공격 시 비용 방어) */
  dailyLimitGlobal: intFromEnv("RATE_LIMIT_DAILY_GLOBAL", 500),
  /** 사용자 입력 최대 글자 수 */
  maxInputChars: intFromEnv("MAX_INPUT_CHARS", 500),
  /** 목적별 모델. 모델명은 코드에 박지 않고 환경변수로만 지정한다. */
  models: {
    parse: process.env.OPENAI_MODEL_PARSE ?? "",
    consult: process.env.OPENAI_MODEL_CONSULT ?? "",
  } satisfies Record<LlmPurpose, string>,
  /** 목적별 추론 강도. 파싱은 단순 분류라 none, 상담은 low가 기본. */
  reasoningEffort: {
    parse: parseReasoningEffort(process.env.OPENAI_REASONING_PARSE, "none"),
    consult: parseReasoningEffort(process.env.OPENAI_REASONING_CONSULT, "low"),
  } satisfies Record<LlmPurpose, ReasoningEffort>,
  windowMs: 24 * 60 * 60 * 1000,
} as const;

export { REASONING_EFFORTS, parseReasoningEffort, serverConfig };
export type { ReasoningEffort, LlmPurpose };
