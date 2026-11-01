import { z } from "zod";
import {
  CHOCOLATE_TYPES,
  ENTRY_KINDS,
  INTENSITIES,
  MODES,
  RISK_FOODS,
  RISK_GRADES,
  STOOL_STATES,
  WEATHERS,
} from "./values";

/** 강아지 프로필. 한 마리 고정이지만 dogId 기준으로 설계해 추후 초대 기반 접근을 붙일 수 있게 한다. */
const DogSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(30),
  /** 나이(살). 추정 나이도 허용 */
  ageYears: z.number().min(0).max(40).nullable(),
  weightKg: z.number().min(0.1).max(120).nullable(),
  /** 특이사항(알레르기, 기저질환 메모 등). 사용자가 직접 적는 자유 메모 */
  notes: z.string().max(500).default(""),
});
type Dog = z.infer<typeof DogSchema>;

/** 기록(LogEntry). 순간 기록과 에피소드 기록을 한 구조로 다룬다. */
const LogEntrySchema = z.object({
  id: z.string().min(1),
  dogId: z.string().min(1),
  kind: z.enum(ENTRY_KINDS),
  /** 일어난(시작한) 시각. ISO 8601 */
  occurredAt: z.iso.datetime({ offset: true }),
  /** "어제 저녁쯤"처럼 시각을 추정했으면 true. 칩에 "추정"으로 표시한다 (PRD R2) */
  timeEstimated: z.boolean().default(false),
  /** 에피소드가 끝난 시각. 비어 있으면 진행 중(열림) */
  endedAt: z.iso.datetime({ offset: true }).nullable().default(null),
  /** 지속시간(초). 사용자가 "2분쯤"이라고만 말한 경우를 위해 endedAt과 별도 */
  durationSec: z.number().int().min(0).nullable().default(null),
  stoolState: z.enum(STOOL_STATES).nullable().default(null),
  intensity: z.enum(INTENSITIES).nullable().default(null),
  /** 횟수 등 숫자 값 (예: 배변 2회) */
  count: z.number().int().min(1).nullable().default(null),
  /** 주워 먹은 것, 간식 이름 등 자유 텍스트 */
  detail: z.string().max(200).nullable().default(null),
  /** 위험 음식이면 그 종류. assess()의 입력이 된다 (PRD R6) */
  riskFood: z.enum(RISK_FOODS).nullable().default(null),
  chocolateType: z.enum(CHOCOLATE_TYPES).nullable().default(null),
  /** 먹은 양(g). 모르면 null */
  amountG: z.number().min(0).max(5000).nullable().default(null),
  /** 날씨. P1에서는 비어 있어도 모든 화면과 집계가 동작해야 한다. */
  weather: z.enum(WEATHERS).nullable().default(null),
  /** 사용자가 입력한 원문. 정규화 기준 개선 시 재분류에 쓴다. */
  rawText: z.string().max(1000).default(""),
  /** 첨부(사진/서류) id 목록. AI가 해석하지 않는다. */
  attachmentIds: z.array(z.string()).default([]),
  /** 데모 데이터로 넣은 기록. 샘플만 지울 때 쓴다 (PRD R10) */
  isDemo: z.boolean().default(false),
  createdAt: z.iso.datetime({ offset: true }),
});
type LogEntry = z.infer<typeof LogEntrySchema>;

/** 칩에서 확신이 낮은 칸. `?` 표시와 후보 칩으로 보여준다 (PRD R1, R8) */
const UncertainFieldSchema = z.object({
  entryId: z.string().min(1),
  field: z.enum(["kind", "occurredAt", "stoolState", "intensity", "durationSec", "amountG", "chocolateType"]),
  /** 후보 값. 값 목록의 값을 그대로 담는다 */
  candidates: z.array(z.string()).default([]),
});
type UncertainField = z.infer<typeof UncertainFieldSchema>;

/**
 * 채팅 응답을 이루는 블록. 기록·상담·안전 안내를 한 메시지 안에 순서대로 담는다 (PRD R0, R1, R4, R6).
 * 숫자와 기록 목록이 들어가는 블록(evidence, episodes)은 코드가 만들고, LLM은 text 블록만 쓴다.
 */
const ChatBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), text: z.string() }),
  /** 저장한 기록의 칩 카드. undone이면 되돌린 상태 */
  z.object({
    type: z.literal("entries"),
    entryIds: z.array(z.string()).min(1),
    uncertain: z.array(UncertainFieldSchema).default([]),
    undone: z.boolean().default(false),
  }),
  /** 상담 근거 기록 카드. 본 범위와 건수를 함께 보여준다 */
  z.object({
    type: z.literal("evidence"),
    rangeLabel: z.string(),
    entryIds: z.array(z.string()),
    /** "배변 9건 · 무름 2, 정상 7"처럼 코드가 계산한 요약 */
    summary: z.string(),
    canExpand: z.boolean().default(true),
  }),
  /** 에피소드 모아 보기 카드 */
  z.object({ type: z.literal("episodes"), entryIds: z.array(z.string()) }),
  /** 위험 등급 안내. 문장은 코드의 고정 문장 (등급 × 모드) */
  z.object({ type: z.literal("risk"), grade: z.enum(RISK_GRADES), title: z.string(), body: z.string() }),
  /** 요청 한도 초과, 오류 같은 시스템 안내 */
  z.object({ type: z.literal("notice"), tone: z.enum(["info", "error"]), text: z.string() }),
]);
type ChatBlock = z.infer<typeof ChatBlockSchema>;
/** 기본값이 있는 칸을 생략할 수 있는 입력 모양 */
type ChatBlockInput = z.input<typeof ChatBlockSchema>;

/** 채팅 메시지. 기록과 상담을 한 대화에 담는다. 이전 대화는 LLM에 넣지 않는다 (PRD R0) */
const ChatMessageSchema = z.object({
  id: z.string().min(1),
  dogId: z.string().min(1),
  role: z.enum(["user", "assistant"]),
  /** user 메시지는 text 블록 하나 */
  blocks: z.array(ChatBlockSchema).min(1),
  createdAt: z.iso.datetime({ offset: true }),
});
type ChatMessage = z.infer<typeof ChatMessageSchema>;

const SettingsSchema = z.object({
  mode: z.enum(MODES).default("neutral"),
});
type Settings = z.infer<typeof SettingsSchema>;

/** 상담 메시지 */
const ConsultMessageSchema = z.object({
  id: z.string().min(1),
  dogId: z.string().min(1),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  createdAt: z.iso.datetime({ offset: true }),
});
type ConsultMessage = z.infer<typeof ConsultMessageSchema>;

export {
  DogSchema,
  LogEntrySchema,
  UncertainFieldSchema,
  ChatBlockSchema,
  ChatMessageSchema,
  SettingsSchema,
  ConsultMessageSchema,
};
export type { Dog, LogEntry, UncertainField, ChatBlock, ChatBlockInput, ChatMessage, Settings, ConsultMessage };
