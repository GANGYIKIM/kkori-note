import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { serverConfig } from "@/lib/server/config";
import { guardLlmRequest } from "@/lib/server/guard";

const BodySchema = z.object({
  text: z.string(),
  /** 어떤 용도의 모델로 확인할지. 기본은 기록 파싱용 */
  purpose: z.enum(["parse", "consult"]).default("parse"),
});

/**
 * 셋업 확인용 라우트: 서버에서만 OpenAI를 호출하고, 횟수·길이 제한을 통과한 요청만 LLM에 도달한다.
 * 이후 기록 파싱/상담 라우트도 같은 guardLlmRequest를 거친다.
 */
export async function POST(request: Request) {
  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request", message: "요청 형식이 올바르지 않아요." }, { status: 400 });
  }
  const text = parsed.data.text.trim();
  const { purpose } = parsed.data;

  const blocked = guardLlmRequest(request, text);
  if (blocked) return blocked;

  const apiKey = process.env.OPENAI_API_KEY;
  const model = serverConfig.models[purpose];
  if (!apiKey || !model) {
    return NextResponse.json(
      {
        error: "not_configured",
        message:
          "서버에 OPENAI_API_KEY 또는 사용할 모델(OPENAI_MODEL_PARSE / OPENAI_MODEL_CONSULT)이 설정되지 않았어요.",
      },
      { status: 503 },
    );
  }

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model,
      reasoning_effort: serverConfig.reasoningEffort[purpose],
      max_completion_tokens: 300,
      messages: [
        { role: "system", content: "한 문장으로 짧게 한국어로 답하세요." },
        { role: "user", content: text },
      ],
    });
    return NextResponse.json({ reply: completion.choices[0]?.message?.content ?? "", purpose });
  } catch (error) {
    console.error("[llm-check] OpenAI 호출 실패", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "llm_failed", message: "AI 응답을 받지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }
}
