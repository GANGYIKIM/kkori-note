import "server-only";
import { NextResponse } from "next/server";
import { checkRateLimit, createMemoryStore } from "./rate-limit";
import { serverConfig } from "./config";

// 모듈 단위 싱글톤 (서버 인스턴스 메모리)
const store = createMemoryStore();

const getClientKey = (request: Request): string => {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return `ip:${ip}`;
};

/**
 * LLM을 호출하기 전에 항상 통과해야 하는 검사.
 * 입력 길이 → 클라이언트별 횟수 → 전체 횟수 순서. 통과 못 하면 LLM을 호출하지 않고 응답을 돌려준다.
 * 통과하면 null.
 */
const guardLlmRequest = (request: Request, text: string): NextResponse | null => {
  if (text.length === 0) {
    return NextResponse.json({ error: "empty_input", message: "내용을 입력해 주세요." }, { status: 400 });
  }
  if (text.length > serverConfig.maxInputChars) {
    return NextResponse.json(
      {
        error: "input_too_long",
        message: `한 번에 ${serverConfig.maxInputChars}자까지 입력할 수 있어요. 조금 줄여서 다시 입력해 주세요.`,
      },
      { status: 413 },
    );
  }

  const perClient = checkRateLimit(
    store,
    getClientKey(request),
    serverConfig.dailyLimitPerClient,
    serverConfig.windowMs,
  );
  if (!perClient.allowed) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "오늘 사용할 수 있는 AI 요청 횟수를 모두 사용했어요. 내일 다시 이용해 주세요.",
        resetAt: perClient.resetAt,
      },
      { status: 429 },
    );
  }

  const global = checkRateLimit(store, "global", serverConfig.dailyLimitGlobal, serverConfig.windowMs);
  if (!global.allowed) {
    return NextResponse.json(
      {
        error: "service_busy",
        message: "지금은 AI 요청이 많아 잠시 쉬고 있어요. 나중에 다시 시도해 주세요.",
        resetAt: global.resetAt,
      },
      { status: 429 },
    );
  }

  return null;
};

export { getClientKey, guardLlmRequest };
