import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { ChatTurnSchema } from "@/lib/domain/types";
import { buildChatGuide } from "@/lib/server/chat-guide";
import { serverConfig } from "@/lib/server/config";
import { guardLlmRequest } from "@/lib/server/guard";

const BodySchema = z.object({
  text: z.string(),
  nowIso: z.iso.datetime({ offset: true }),
  timeZone: z.string().min(1).max(64),
  dogName: z.string().max(30).nullable(),
  isFirstTurn: z.boolean(),
});

/** 채팅 메시지 하나를 LLM 한 번으로 의도·답변·이름·기록으로 나눈다 (demo 브랜치). 이전 대화는 받지 않는다 */
export async function POST(request: Request) {
  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request", message: "요청 형식이 올바르지 않아요." }, { status: 400 });
  }
  const text = parsed.data.text.trim();

  const blocked = guardLlmRequest(request, text);
  if (blocked) return blocked;

  const apiKey = process.env.OPENAI_API_KEY;
  const model = serverConfig.models.parse;
  if (!apiKey || !model) {
    return NextResponse.json(
      { error: "not_configured", message: "서버에 OPENAI_API_KEY 또는 OPENAI_MODEL_PARSE가 설정되지 않았어요." },
      { status: 503 },
    );
  }

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model,
      reasoning_effort: serverConfig.reasoningEffort.parse,
      max_completion_tokens: 800,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildChatGuide(parsed.data) },
        { role: "user", content: text },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "";
    const turn = ChatTurnSchema.safeParse(JSON.parse(content));
    if (!turn.success) throw new Error("LLM 출력 모양이 맞지 않음");
    return NextResponse.json(turn.data);
  } catch (error) {
    console.error("[chat] 처리 실패", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "llm_failed", message: "AI 응답을 받지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }
}
