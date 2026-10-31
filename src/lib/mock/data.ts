/**
 * 화면 미리보기용 가짜 데이터 (PRD의 예시 케이스).
 * 실제 데이터 모델(Zod 스키마)로 만들어, 나중에 저장소와 로직으로 그대로 갈아 끼운다.
 * 시각은 고정된 "지금"(2026-10-29 12:00 KST) 기준이다.
 */
import {
  ChatMessageSchema,
  DogSchema,
  LogEntrySchema,
  type ChatBlockInput,
  type ChatMessage,
  type Dog,
  type LogEntry,
} from "@/lib/domain/types";
import { LABELS, STOOL_STATES } from "@/lib/domain/values";

const MOCK_TIME_ZONE = "Asia/Seoul";
const MOCK_NOW = "2026-10-29T03:00:00.000Z";

const MOCK_DOG: Dog = DogSchema.parse({
  id: "dog-1",
  name: "초코",
  ageYears: 4,
  weightKg: 6.2,
  notes: "닭고기 알레르기 의심",
});

/** KST 날짜·시각을 UTC ISO 문자열로 */
const kst = (date: string, time: string): string => {
  return new Date(`${date}T${time}:00+09:00`).toISOString();
};

const entry = (fields: Partial<LogEntry> & Pick<LogEntry, "id" | "kind" | "occurredAt">): LogEntry => {
  return LogEntrySchema.parse({ dogId: MOCK_DOG.id, createdAt: fields.occurredAt, ...fields });
};

/** 메인 목록에 보이는 기록 (최근 일주일) */
const MOCK_ENTRIES: LogEntry[] = [
  // 10/29 오늘
  entry({
    id: "e-poop-soft",
    kind: "poop",
    occurredAt: kst("2026-10-29", "11:58"),
    stoolState: "soft",
    rawText: "방금 배변했는데 무른 편이야",
  }),
  entry({ id: "e-poop-unknown", kind: "poop", occurredAt: kst("2026-10-29", "11:40"), rawText: "응가 했어" }),
  entry({
    id: "e-meal",
    kind: "meal",
    occurredAt: kst("2026-10-29", "08:00"),
    timeEstimated: true,
    rawText: "밥 먹고 산책했어",
  }),
  entry({
    id: "e-walk",
    kind: "walk",
    occurredAt: kst("2026-10-29", "11:00"),
    durationSec: 1800,
    rawText: "밥 먹고 산책했어",
  }),
  entry({
    id: "e-seizure-today",
    kind: "seizure",
    occurredAt: kst("2026-10-29", "10:30"),
    endedAt: kst("2026-10-29", "10:32"),
    durationSec: 120,
    rawText: "발작했어",
  }),
  entry({
    id: "e-diarrhea",
    kind: "poop",
    occurredAt: kst("2026-10-29", "09:00"),
    timeEstimated: true,
    stoolState: "diarrhea",
    rawText: "오늘 설사했는데 왜 그럴까?",
  }),
  entry({
    id: "e-choco",
    kind: "picked_up",
    occurredAt: kst("2026-10-29", "11:50"),
    riskFood: "chocolate",
    rawText: "초코가 초코 먹었어",
  }),
  entry({
    id: "e-thunder",
    kind: "thunder_fear",
    occurredAt: kst("2026-10-29", "11:48"),
    intensity: "medium",
    rawText: "천둥 쳐서 덜덜 떨어",
  }),
  // 10/28 어제
  entry({ id: "e-28-meal", kind: "meal", occurredAt: kst("2026-10-28", "08:00") }),
  entry({ id: "e-28-poop", kind: "poop", occurredAt: kst("2026-10-28", "08:20"), stoolState: "normal" }),
  entry({ id: "e-28-snack", kind: "snack", occurredAt: kst("2026-10-28", "15:00"), detail: "닭가슴살 육포 (새 간식)" }),
  entry({
    id: "e-28-walk",
    kind: "walk",
    occurredAt: kst("2026-10-28", "18:30"),
    durationSec: 2400,
    detail: "다른 강아지랑 잘 놀았어",
  }),
  entry({ id: "e-28-picked", kind: "picked_up", occurredAt: kst("2026-10-28", "18:50"), detail: "휴지 조각" }),
  entry({ id: "e-28-poop2", kind: "poop", occurredAt: kst("2026-10-28", "20:10"), stoolState: "soft" }),
  entry({ id: "e-28-poop3", kind: "poop", occurredAt: kst("2026-10-28", "23:40"), stoolState: "soft" }),
  // 10/27
  entry({ id: "e-27-poop", kind: "poop", occurredAt: kst("2026-10-27", "08:10"), stoolState: "normal" }),
  entry({
    id: "e-27-limp",
    kind: "limp",
    occurredAt: kst("2026-10-27", "17:00"),
    endedAt: kst("2026-10-27", "17:10"),
    durationSec: 600,
    intensity: "low",
    detail: "왼쪽 뒷다리",
  }),
  entry({ id: "e-27-note", kind: "note", occurredAt: kst("2026-10-27", "21:00"), detail: "미용 다녀옴" }),
  // 10/25
  entry({ id: "e-25-poop", kind: "poop", occurredAt: kst("2026-10-25", "09:00"), stoolState: "normal" }),
  entry({
    id: "e-25-seizure",
    kind: "seizure",
    occurredAt: kst("2026-10-25", "22:15"),
    endedAt: kst("2026-10-25", "22:16"),
    durationSec: 90,
    intensity: "high",
  }),
  // 10/23
  entry({ id: "e-23-poop", kind: "poop", occurredAt: kst("2026-10-23", "08:30"), stoolState: "hard" }),
  // 10/20 (최근 7일 밖, 범위 확장용)
  entry({ id: "e-20-poop", kind: "poop", occurredAt: kst("2026-10-20", "08:30"), stoolState: "normal" }),
];

/** 위험 기록에 양·종류를 보충한 뒤의 상태 (케이스 7-2) */
const CHOCO_UPDATED = {
  ...MOCK_ENTRIES.find((e) => e.id === "e-choco")!,
  chocolateType: "milk",
  amountG: 20,
} satisfies LogEntry;

/** 되돌린 기록 (케이스 9). 저장소에는 없고 채팅 카드에만 남는다 */
const UNDONE_WALK = entry({
  id: "e-undone-walk",
  kind: "walk",
  occurredAt: kst("2026-10-29", "11:59"),
  rawText: "산책 다녀왔어",
});

const toEntryMap = (entries: readonly LogEntry[]): Record<string, LogEntry> => {
  return Object.fromEntries(entries.map((e) => [e.id, e]));
};

/** 최근 7일 배변 요약. 숫자는 코드가 계산한다 (CLAUDE.md 규칙 3) */
const poopSummary = (fromDate: string): { ids: string[]; summary: string } => {
  const poops = MOCK_ENTRIES.filter((e) => e.kind === "poop" && e.occurredAt >= kst(fromDate, "00:00"));
  const parts = STOOL_STATES.map((s) => [s, poops.filter((p) => p.stoolState === s).length] as const)
    .filter(([, n]) => n > 0)
    .map(([s, n]) => `${LABELS.stoolState[s]} ${n}`);
  const unknown = poops.filter((p) => p.stoolState === null).length;
  if (unknown > 0) parts.push(`상태 모름 ${unknown}`);
  return { ids: poops.map((p) => p.id), summary: `배변 ${poops.length}건 · ${parts.join(", ")}` };
};

let seq = 0;
const message = (role: ChatMessage["role"], blocks: ChatBlockInput[]): ChatMessage => {
  seq += 1;
  return ChatMessageSchema.parse({
    id: `m-${seq}`,
    dogId: MOCK_DOG.id,
    role,
    blocks,
    createdAt: new Date(Date.parse(MOCK_NOW) - (100 - seq) * 60_000).toISOString(),
  });
};
const user = (text: string) => message("user", [{ type: "text", text }]);
const bot = (...blocks: ChatBlockInput[]) => message("assistant", blocks);

interface ChatCase {
  id: string;
  title: string;
  /** PRD 근거 */
  prd: string;
  messages: ChatMessage[];
  entries: Record<string, LogEntry>;
}

const base = toEntryMap(MOCK_ENTRIES);
const lastWeek = poopSummary("2026-10-23");

const CHAT_CASES: ChatCase[] = [
  {
    id: "other",
    title: "기록도 상담도 아닌 말",
    prd: "R1 의도: 기타",
    entries: base,
    messages: [
      user("안녕!"),
      bot({
        type: "text",
        text: "안녕하세요! 초코에게 있었던 일을 적어 주시면 기록하고, 궁금한 걸 물어보시면 기록을 바탕으로 답해 드릴게요.",
      }),
    ],
  },
  {
    id: "record-simple",
    title: "1. 단순 기록",
    prd: "R1, R3",
    entries: base,
    messages: [
      user("방금 배변했는데 무른 편이야"),
      bot({ type: "text", text: "초코의 배변을 기록했어요." }, { type: "entries", entryIds: ["e-poop-soft"] }),
    ],
  },
  {
    id: "record-uncertain",
    title: "2. 빈 칸이 있는 기록",
    prd: "R1, R8 (? 표시와 후보 칩)",
    entries: base,
    messages: [
      user("응가 했어"),
      bot(
        { type: "text", text: "초코의 배변을 기록했어요. 상태(무른지, 딱딱한지)를 알려주시면 더 정확해요." },
        {
          type: "entries",
          entryIds: ["e-poop-unknown"],
          uncertain: [{ entryId: "e-poop-unknown", field: "stoolState", candidates: ["normal", "soft", "diarrhea"] }],
        },
      ),
    ],
  },
  {
    id: "record-multiple",
    title: "3. 한 문장에 기록 여러 개",
    prd: "R1, R2 (추정 시각)",
    entries: base,
    messages: [
      user("밥 먹고 산책했어"),
      bot(
        { type: "text", text: "식사와 산책을 기록했어요. 식사 시각은 추정했으니 다르면 고쳐 주세요." },
        { type: "entries", entryIds: ["e-meal", "e-walk"] },
      ),
    ],
  },
  {
    id: "episode",
    title: "4. 에피소드 열고 닫기",
    prd: "R1 에피소드",
    entries: { ...base, "e-seizure-today": { ...base["e-seizure-today"], endedAt: null, durationSec: null } },
    messages: [
      user("발작했어"),
      bot(
        { type: "text", text: '초코의 발작을 기록했어요. 끝나면 "끝났어"라고 알려주세요.' },
        { type: "entries", entryIds: ["e-seizure-today"] },
      ),
    ],
  },
  {
    id: "episode-close",
    title: "4-2. 에피소드 닫기",
    prd: "R1 에피소드 닫기 규칙",
    entries: base,
    messages: [
      user("끝났어, 2분쯤"),
      bot(
        { type: "text", text: "발작 기록에 지속시간 2분을 붙였어요." },
        { type: "entries", entryIds: ["e-seizure-today"] },
      ),
    ],
  },
  {
    id: "consult-lookup",
    title: "5. 조회 상담",
    prd: "R4 (근거 카드는 코드, 해석은 LLM)",
    entries: base,
    messages: [
      user("지난주 배변 어땠어?"),
      bot(
        {
          type: "evidence",
          rangeLabel: "최근 7일 · 10월 23일 ~ 29일",
          entryIds: lastWeek.ids,
          summary: lastWeek.summary,
          canExpand: true,
        },
        {
          type: "text",
          text: "일주일 동안 배변은 대체로 하루 1~2번이었어요. 어제 저녁부터 무른 변이 이어지다 오늘 아침 설사가 한 번 있었어요. 오늘 하루는 변 상태와 물 마시는 양을 함께 지켜봐 주세요.",
        },
      ),
    ],
  },
  {
    id: "record-and-consult",
    title: "6. 기록 + 상담",
    prd: "R4 기록+상담 응답 순서",
    entries: base,
    messages: [
      user("오늘 설사했는데 왜 그럴까?"),
      bot(
        {
          type: "evidence",
          rangeLabel: "최근 3일 · 식사·간식·주워 먹은 것",
          entryIds: ["e-meal", "e-28-meal", "e-28-snack", "e-28-picked"],
          summary: "식사 2건 · 간식 1건 · 주워 먹은 것 1건",
          canExpand: true,
        },
        {
          type: "text",
          text: "설사는 보통 최근 2~3일 동안 먹은 것의 영향을 받아요. 기록을 보면 어제 처음 먹은 닭가슴살 육포와, 산책 중 주워 먹은 휴지 조각이 원인 후보예요. 프로필에 닭고기 알레르기 의심이 적혀 있어서 육포 쪽을 먼저 의심해 볼 만해요.",
        },
        {
          type: "text",
          text: "말씀하신 설사 증상은 아래처럼 기록했어요. 더 알려주실 게 있으면 말씀해 주시거나 칩에서 고쳐 주세요.",
        },
        { type: "entries", entryIds: ["e-diarrhea"] },
      ),
    ],
  },
  {
    id: "risk-unknown",
    title: "7. 위험 기록 (양 모름 → 🔴)",
    prd: "R3 예외, R6 (정보 부족하면 고위험)",
    entries: base,
    messages: [
      user("초코가 초코 먹었어"),
      bot(
        { type: "text", text: "초코가 초콜릿을 먹은 것을 기록했어요." },
        {
          type: "entries",
          entryIds: ["e-choco"],
          uncertain: [
            { entryId: "e-choco", field: "chocolateType", candidates: ["milk", "dark", "white"] },
            { entryId: "e-choco", field: "amountG", candidates: [] },
          ],
        },
        {
          type: "risk",
          grade: "high",
          title: "지금 가까운 동물병원에 연락해 주세요",
          body: "초콜릿은 종류와 먹은 양에 따라 위험할 수 있고, 시간이 중요해요. 야간이면 24시간 동물병원에 연락해 주세요.",
        },
        { type: "text", text: "어떤 초콜릿을 얼마나 먹었는지 알려주시면 위험도를 다시 계산해 드릴게요." },
      ),
    ],
  },
  {
    id: "risk-updated",
    title: "7-2. 양·종류 보충 → 재판정 (무던 모드)",
    prd: "R1 예외, R6 등급 × 모드 문장",
    entries: { ...base, "e-choco": CHOCO_UPDATED },
    messages: [
      user("밀크초콜릿 반 개, 20g쯤"),
      bot(
        { type: "text", text: "초콜릿 기록에 종류와 양을 붙였어요." },
        { type: "entries", entryIds: ["e-choco"] },
        {
          type: "risk",
          grade: "low",
          title: "이 양이면 크게 위험하지 않을 수 있어요",
          body: "6~12시간 정도 구토·설사·흥분이 있는지 지켜보시고, 다니시는 병원에 문의해 보시면 더 좋아요.",
        },
      ),
    ],
  },
  {
    id: "risk-caution",
    title: "7-3. 경계 등급 예시 (중립 모드)",
    prd: "R6 🟡는 모든 모드에 전화 상담 포함",
    entries: { ...base, "e-choco": { ...CHOCO_UPDATED, chocolateType: "dark", amountG: 15 } },
    messages: [
      user("다크초콜릿 15g쯤 먹었어"),
      bot(
        { type: "text", text: "초콜릿 기록에 종류와 양을 붙였어요." },
        { type: "entries", entryIds: ["e-choco"] },
        {
          type: "risk",
          grade: "caution",
          title: "병원에 전화로 상담받아 보시길 권해요",
          body: "몸무게에 비해 주의가 필요한 양이에요. 지금 상태와 먹은 양을 말씀하시면 병원에서 와야 할지 알려줄 거예요.",
        },
      ),
    ],
  },
  {
    id: "episodes-lookup",
    title: "8. 에피소드 모아 보기",
    prd: "R4 수락 기준 (에피소드 카드)",
    entries: base,
    messages: [
      user("발작 기록 모아서 보여줘"),
      bot(
        { type: "text", text: "최근 30일 발작 기록 2건을 모았어요." },
        { type: "episodes", entryIds: ["e-seizure-today", "e-25-seizure"] },
      ),
    ],
  },
  {
    id: "undo",
    title: "9. 되돌린 기록",
    prd: "R1 칩 즉시 저장 + 되돌리기",
    entries: { ...base, [UNDONE_WALK.id]: UNDONE_WALK },
    messages: [
      user("산책 다녀왔어"),
      bot(
        { type: "text", text: "초코의 산책을 기록했어요." },
        { type: "entries", entryIds: [UNDONE_WALK.id], undone: true },
      ),
    ],
  },
  {
    id: "rate-limited",
    title: "10. 요청 한도 초과",
    prd: "R9, R1 (LLM 없이도 기록은 저장)",
    entries: base,
    messages: [
      user("요즘 컨디션 어때 보여?"),
      bot({
        type: "notice",
        tone: "error",
        text: "오늘 사용할 수 있는 AI 상담 횟수를 모두 사용했어요. 기록은 계속 남길 수 있어요.",
      }),
    ],
  },
];

/** 메인 화면 채팅에 보일 대화 (재판정 예시는 빼고 순서대로 이어 붙임) */
const MAIN_CHAT_CASE_IDS = [
  "other",
  "record-simple",
  "record-uncertain",
  "record-multiple",
  "episode-close",
  "consult-lookup",
  "record-and-consult",
  "risk-unknown",
  "episodes-lookup",
] as const;

export { MOCK_TIME_ZONE, MOCK_NOW, MOCK_DOG, MOCK_ENTRIES, toEntryMap, CHAT_CASES, MAIN_CHAT_CASE_IDS };
export type { ChatCase };
