import "server-only";
import OpenAI from "openai";
import { ChatTurnSchema, type ChatTurn } from "@/lib/domain/types";
import { buildChatGuide } from "./chat-guide";
import { serverConfig } from "./config";

interface ChatLlmInput {
  text: string;
  nowIso: string;
  timeZone: string;
  dogName: string | null;
  isFirstTurn: boolean;
}

interface ChatLlmResult {
  turn: ChatTurn;
  usage: { inputTokens: number; outputTokens: number };
  ms: number;
}

/** 채팅 메시지 하나를 LLM 한 번으로 의도·답변·이름·기록으로 나눈다. 이전 대화는 받지 않는다. 실패하면 예외를 던진다 */
const callChatLlm = async (
  { text, ...context }: ChatLlmInput,
  { apiKey, model }: { apiKey: string; model: string },
): Promise<ChatLlmResult> => {
  const startedAt = performance.now();
  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model,
    reasoning_effort: serverConfig.reasoningEffort.parse,
    max_completion_tokens: 800,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildChatGuide(context) },
      { role: "user", content: text },
    ],
  });
  const ms = performance.now() - startedAt;
  const turn = ChatTurnSchema.safeParse(JSON.parse(completion.choices[0]?.message?.content ?? ""));
  if (!turn.success) throw new Error("LLM 출력 모양이 맞지 않음");
  return {
    turn: turn.data,
    usage: {
      inputTokens: completion.usage?.prompt_tokens ?? 0,
      outputTokens: completion.usage?.completion_tokens ?? 0,
    },
    ms,
  };
};

export { callChatLlm };
export type { ChatLlmInput, ChatLlmResult };
