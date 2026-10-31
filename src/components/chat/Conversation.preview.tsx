import { CHAT_CASES, MOCK_NOW, MOCK_TIME_ZONE } from "@/lib/mock/data";
import type { Variant } from "@/components/preview/variant";
import { Conversation } from "./Conversation";

const sample = CHAT_CASES.find((c) => c.id === "record-and-consult") ?? CHAT_CASES[0];

const variants: Variant[] = [
  {
    name: "사용자 말 + 응답 블록",
    note: "PRD 예시 대화는 모두 PRD 장면 탭에 있어요.",
    render: () => (
      <Conversation messages={sample.messages} entries={sample.entries} nowIso={MOCK_NOW} timeZone={MOCK_TIME_ZONE} />
    ),
  },
];

export { variants };
