"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChatBlockInput, ChatMessage, Dog, LogEntry, UncertainField } from "@/lib/domain/types";
import { ChatMessageSchema } from "@/lib/domain/types";
import { findField, findKind, isEpisodeKind } from "@/lib/domain/kinds";
import { toDrafts } from "@/lib/domain/chat-turn";
import { recordReply } from "@/lib/domain/record-reply";
import { fromList, type LoadState } from "@/lib/domain/load-state";
import { DEFAULT_DOG_ID, getStorage } from "@/lib/client/storage";
import { postChat } from "@/lib/client/chat-api";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomSheet } from "@/components/layout/BottomSheet";
import { ScrollArea } from "@/components/common/ScrollArea";
import { LoadStateView } from "@/components/common/LoadStateView";
import { ErrorState } from "@/components/common/ErrorState";
import { MessageComposer, ComposerLauncher } from "@/components/chat/MessageComposer";
import { SidePanel } from "@/components/layout/SidePanel";
import { Conversation } from "@/components/chat/Conversation";
import { ConversationSkeleton } from "@/components/chat/ConversationSkeleton";
import { EditSheet } from "@/components/entry/EditSheet";
import { DateGroupedList } from "@/components/entry/DateGroupedList";
import { FirstRecordGuide } from "@/components/entry/FirstRecordGuide";
import { ListSkeleton } from "@/components/entry/ListSkeleton";
import { OngoingEpisodeBar } from "@/components/entry/OngoingEpisodeBar";

type LoadStatus = "loading" | "error" | "ready";

const DEFAULT_TIME_ZONE = "Asia/Seoul";
const EPOCH_ISO = "1970-01-01T00:00:00.000Z";

const toMap = (list: readonly LogEntry[]): Record<string, LogEntry> => Object.fromEntries(list.map((e) => [e.id, e]));

const assistantMessage = (blocks: ChatBlockInput[]): ChatMessage =>
  ChatMessageSchema.parse({
    id: crypto.randomUUID(),
    dogId: DEFAULT_DOG_ID,
    role: "assistant",
    createdAt: new Date().toISOString(),
    blocks,
  });

/**
 * 메인 화면 (PRD R0): 기록 목록 + 진행 중 띠 + 하단 입력창 → 채팅. 넓은 화면은 기록 목록과 채팅을 나란히 둔다.
 * 기록·대화·프로필은 브라우저 저장소에 두고, 메시지는 /api/chat 한 번으로 처리한다 (demo 브랜치).
 */
const Home = () => {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [dog, setDog] = useState<Dog | null>(null);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  // 되돌리거나 지운 기록도 채팅 카드에서는 보여야 해서 따로 남긴다
  const [archived, setArchived] = useState<Record<string, LogEntry>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [editing, setEditing] = useState<LogEntry | null>(null);
  // 렌더 중에 현재 시각을 읽지 않도록 불러온 뒤와 30초마다 채운다
  const [nowIso, setNowIso] = useState(EPOCH_ISO);
  const [timeZone, setTimeZone] = useState(DEFAULT_TIME_ZONE);
  const [loadCount, setLoadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const storage = getStorage();
      const [savedDog, savedEntries, savedMessages] = await Promise.all([
        storage.getDog(),
        storage.listEntries(DEFAULT_DOG_ID),
        storage.listChatMessages(DEFAULT_DOG_ID),
      ]);
      if (cancelled) return;
      setNowIso(new Date().toISOString());
      setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIME_ZONE);
      setDog(savedDog);
      setEntries(savedEntries);
      setMessages(savedMessages);
      setStatus("ready");
    })().catch(() => {
      if (!cancelled) setStatus("error");
    });
    const timer = setInterval(() => setNowIso(new Date().toISOString()), 30_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [loadCount]);

  const reload = () => {
    setStatus("loading");
    setLoadCount((n) => n + 1);
  };

  const chatEntries = useMemo(() => ({ ...archived, ...toMap(entries) }), [archived, entries]);
  const ongoing = entries.filter((e) => isEpisodeKind(e.kindId) && e.endedAt === null && e.durationSec === null);
  const dogName = dog?.name ?? null;

  const appendMessage = (message: ChatMessage) => {
    setMessages((list) => [...list, message]);
    void getStorage().saveChatMessage(message);
  };

  const updateEntry = (next: LogEntry) => {
    setEntries((list) => list.map((e) => (e.id === next.id ? next : e)));
    void getStorage().saveEntry(next);
  };

  const removeEntries = (ids: string[]) => {
    const removed = entries.filter((e) => ids.includes(e.id));
    setArchived((map) => ({ ...map, ...toMap(removed) }));
    setEntries((list) => list.filter((e) => !ids.includes(e.id)));
    for (const id of ids) void getStorage().deleteEntry(id);
  };

  const undo = (ids: string[]) => {
    removeEntries(ids);
    const touched: ChatMessage[] = [];
    const next = messages.map((m) => {
      if (!m.blocks.some((b) => b.type === "entries" && b.entryIds.some((id) => ids.includes(id)))) return m;
      const updated = {
        ...m,
        blocks: m.blocks.map((b) =>
          b.type === "entries" && b.entryIds.some((id) => ids.includes(id)) ? { ...b, undone: true } : b,
        ),
      };
      touched.push(updated);
      return updated;
    });
    setMessages(next);
    for (const m of touched) void getStorage().saveChatMessage(m);
  };

  const pick = (entryId: string, field: UncertainField["field"], value: string) => {
    const target = entries.find((e) => e.id === entryId);
    if (!target) return;
    if (field === "kindId" || field === "occurredAt") {
      updateEntry({ ...target, [field]: value });
    } else if (field === "durationSec") {
      updateEntry({ ...target, durationSec: Number(value) });
    } else {
      const numeric = findField(findKind(target.kindId), field)?.type === "number";
      updateEntry({ ...target, values: { ...target.values, [field]: numeric ? Number(value) : value } });
    }
  };

  const closeEpisode = (episode: LogEntry) => {
    const endedAt = new Date().toISOString();
    const durationSec = Math.max(0, Math.round((Date.parse(endedAt) - Date.parse(episode.occurredAt)) / 1000));
    updateEntry({ ...episode, endedAt, durationSec });
  };

  const saveDogName = async (name: string): Promise<string> => {
    const next: Dog = dog ? { ...dog, name } : { id: DEFAULT_DOG_ID, name, ageYears: null, weightKg: null, notes: "" };
    await getStorage().saveDog(next);
    setDog(next);
    return name;
  };

  const send = async (text: string) => {
    if (pending) return;
    const sentAt = new Date().toISOString();
    const isFirstTurn = messages.length === 0;
    appendMessage(
      ChatMessageSchema.parse({
        id: crypto.randomUUID(),
        dogId: DEFAULT_DOG_ID,
        role: "user",
        createdAt: sentAt,
        blocks: [{ type: "text", text }],
      }),
    );
    setPending(true);

    const result = await postChat({ text, nowIso: sentAt, timeZone, dogName, isFirstTurn });
    setPending(false);

    if (!result.ok) {
      appendMessage(assistantMessage([{ type: "notice", tone: "error", text: result.message }]));
      return;
    }

    const { turn } = result;
    if (turn.intent === "set_name" && turn.dogName) {
      try {
        const name = await saveDogName(turn.dogName);
        appendMessage(
          assistantMessage([
            { type: "text", text: turn.reply || `이름을 ${name}(으)로 저장했어요.` },
            { type: "notice", tone: "info", text: "설정에서 이름을 확인할 수 있어요." },
          ]),
        );
      } catch {
        appendMessage(assistantMessage([{ type: "notice", tone: "error", text: "이름을 저장하지 못했어요." }]));
      }
      return;
    }

    const drafts = toDrafts(turn.entries, { nowIso: sentAt, timeZone, rawText: text });
    if (drafts.length > 0) {
      const saved: LogEntry[] = drafts.map((d) => ({
        id: crypto.randomUUID(),
        dogId: DEFAULT_DOG_ID,
        kindId: d.kindId,
        occurredAt: d.occurredAt,
        timePrecision: d.timePrecision,
        endedAt: null,
        durationSec: d.durationSec,
        values: d.values,
        weather: null,
        rawText: d.rawText,
        attachmentIds: [],
        isDemo: false,
        createdAt: sentAt,
      }));
      try {
        await Promise.all(saved.map((e) => getStorage().saveEntry(e)));
      } catch {
        appendMessage(assistantMessage([{ type: "notice", tone: "error", text: "기록을 저장하지 못했어요." }]));
        return;
      }
      setEntries((list) => [...list, ...saved]);
      appendMessage(
        assistantMessage([
          { type: "text", text: recordReply(dogName ?? "강아지", drafts) },
          { type: "entries", entryIds: saved.map((e) => e.id) },
        ]),
      );
      return;
    }

    appendMessage(
      assistantMessage([{ type: "text", text: turn.reply || "잘 이해하지 못했어요. 조금 다르게 말해 주시겠어요?" }]),
    );
  };

  const chatTitle = dogName ? `${dogName}와 대화` : "꼬리노트와 대화";
  const ongoingBar = <OngoingEpisodeBar episodes={ongoing} nowIso={nowIso} onClose={closeEpisode} />;
  const chatFooter = (autoFocus: boolean) => (
    <div className="space-y-2">
      {ongoingBar}
      <MessageComposer onSend={(text) => void send(text)} autoFocus={autoFocus} />
    </div>
  );
  const chat =
    status === "loading" ? (
      <ConversationSkeleton />
    ) : (
      <div className="space-y-4">
        <Conversation
          messages={messages}
          entries={chatEntries}
          nowIso={nowIso}
          timeZone={timeZone}
          actions={{ onEdit: setEditing, onPick: pick, onUndo: undo }}
        />
        {pending ? <p className="w-fit rounded-2xl rounded-bl-md bg-surface px-4 py-2.5 text-muted">…</p> : null}
      </div>
    );
  const listState: LoadState<readonly LogEntry[]> = status === "ready" ? fromList(entries) : { status };

  // 넓은 화면(lg 이상)은 왼쪽 기록 목록 + 오른쪽 채팅 패널, 좁은 화면은 입력창을 누르면 채팅 시트가 열린다
  return (
    <div className="h-dvh lg:mx-auto lg:grid lg:w-[92%] lg:max-w-[1200px] lg:grid-cols-[minmax(0,1fr)_min(40%,420px)]">
      <div className="flex h-full min-h-0 flex-col">
        <div className="shrink-0 bg-background lg:h-14">
          <div className="mx-auto w-[92%] lg:w-full lg:pr-4 lg:pl-3">
            <AppHeader dogName={dogName} />
          </div>
        </div>

        <ScrollArea className="flex-1" viewportClassName="flex flex-col-reverse">
          <main
            className={`ml-[calc((100%+0.875rem)*0.04)] w-[min(calc((100%+0.875rem)*0.92),calc(100%-(100%+0.875rem)*0.04))] space-y-4 pt-2 pb-4 lg:ml-0 lg:w-full lg:pb-8 ${listState.status === "empty" ? "flex grow flex-col" : ""}`}
          >
            <LoadStateView
              state={listState}
              loading={<ListSkeleton />}
              empty={<FirstRecordGuide nowIso={nowIso} timeZone={timeZone} />}
              error={<ErrorState message="기록을 불러오지 못했어요." onRetry={reload} />}
            >
              {(list) => <DateGroupedList entries={list} nowIso={nowIso} timeZone={timeZone} onSelect={setEditing} />}
            </LoadStateView>
          </main>
        </ScrollArea>

        <div className="shrink-0 bg-background pt-2 pb-4 lg:hidden">
          <div className="mx-auto w-[92%] space-y-2">
            {ongoingBar}
            <ComposerLauncher onOpen={() => setChatOpen(true)} />
          </div>
        </div>
      </div>

      <aside className="hidden min-h-0 border-l border-border lg:block">
        <SidePanel title={chatTitle} footer={chatFooter(false)}>
          {chat}
        </SidePanel>
      </aside>

      <BottomSheet
        open={chatOpen}
        title={chatTitle}
        showTitle={false}
        onClose={() => setChatOpen(false)}
        full
        stickToBottom
        className="lg:hidden"
        footer={chatFooter(true)}
      >
        {chat}
      </BottomSheet>

      <EditSheet
        entry={editing}
        timeZone={timeZone}
        onClose={() => setEditing(null)}
        onSave={(next) => {
          updateEntry(next);
          setEditing(null);
        }}
        onDelete={(id) => {
          removeEntries([id]);
          setEditing(null);
        }}
      />
    </div>
  );
};

export { Home };
