import "client-only";
import { ChatTurnSchema, type ChatTurn } from "@/lib/domain/types";

type ChatResult = { ok: true; turn: ChatTurn } | { ok: false; message: string };

const postChat = async (body: {
  text: string;
  nowIso: string;
  timeZone: string;
  dogName: string | null;
  isFirstTurn: boolean;
}): Promise<ChatResult> => {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const json: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const message =
        typeof json === "object" && json !== null && "message" in json && typeof json.message === "string"
          ? json.message
          : "AI 응답을 받지 못했어요. 잠시 후 다시 시도해 주세요.";
      return { ok: false, message };
    }
    const turn = ChatTurnSchema.safeParse(json);
    if (!turn.success) return { ok: false, message: "AI 응답을 읽지 못했어요. 다시 시도해 주세요." };
    return { ok: true, turn: turn.data };
  } catch {
    return { ok: false, message: "네트워크에 연결하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }
};

export { postChat };
