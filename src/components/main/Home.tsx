"use client";

import { useMemo, useState } from "react";
import type { ChatMessage, LogEntry, UncertainField } from "@/lib/domain/types";
import { findField, findKind, isEpisodeKind } from "@/lib/domain/kinds";
import {
  CHAT_CASES,
  MAIN_CHAT_CASE_IDS,
  MOCK_DOG,
  MOCK_ENTRIES,
  MOCK_NOW,
  MOCK_TIME_ZONE,
  toEntryMap,
} from "@/lib/mock/data";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomSheet } from "@/components/layout/BottomSheet";
import { ScrollArea } from "@/components/common/ScrollArea";
import { MessageComposer, ComposerLauncher } from "@/components/chat/MessageComposer";
import { SidePanel } from "@/components/layout/SidePanel";
import { Conversation } from "@/components/chat/Conversation";
import { EditSheet } from "@/components/entry/EditSheet";
import { DateGroupedList } from "@/components/entry/DateGroupedList";
import { FirstRecordGuide } from "@/components/entry/FirstRecordGuide";
import { OngoingEpisodeBar } from "@/components/entry/OngoingEpisodeBar";

const INITIAL_MESSAGES: ChatMessage[] = MAIN_CHAT_CASE_IDS.flatMap(
  (id) => CHAT_CASES.find((c) => c.id === id)?.messages ?? [],
);

/**
 * 메인 화면 (PRD R0): 기록 목록 + 진행 중 띠 + 하단 입력창 → 채팅. 넓은 화면은 기록 목록과 채팅을 나란히 둔다.
 * 지금은 가짜 데이터로 동작하는 화면 미리보기다. 저장소·파싱·상담 로직은 다음 단계에서 붙인다.
 */
const Home = () => {
  const [entries, setEntries] = useState<LogEntry[]>(MOCK_ENTRIES);
  // 되돌리거나 지운 기록도 채팅 카드에서는 보여야 해서 따로 남긴다
  const [archived, setArchived] = useState<Record<string, LogEntry>>({});
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [chatOpen, setChatOpen] = useState(false);
  const [editing, setEditing] = useState<LogEntry | null>(null);

  const chatEntries = useMemo(() => ({ ...archived, ...toEntryMap(entries) }), [archived, entries]);
  const ongoing = entries.filter((e) => isEpisodeKind(e.kindId) && e.endedAt === null && e.durationSec === null);

  const updateEntry = (next: LogEntry) => {
    setEntries((list) => list.map((e) => (e.id === next.id ? next : e)));
  };

  const removeEntries = (ids: string[]) => {
    const removed = entries.filter((e) => ids.includes(e.id));
    setArchived((map) => ({ ...map, ...toEntryMap(removed) }));
    setEntries((list) => list.filter((e) => !ids.includes(e.id)));
  };

  const undo = (ids: string[]) => {
    removeEntries(ids);
    setMessages((list) =>
      list.map((m) => ({
        ...m,
        blocks: m.blocks.map((b) =>
          b.type === "entries" && b.entryIds.some((id) => ids.includes(id)) ? { ...b, undone: true } : b,
        ),
      })),
    );
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
    const durationSec = Math.max(0, Math.round((Date.parse(MOCK_NOW) - Date.parse(episode.occurredAt)) / 1000));
    updateEntry({ ...episode, endedAt: MOCK_NOW, durationSec });
  };

  const send = (text: string) => {
    const createdAt = new Date().toISOString();
    setMessages((list) => [
      ...list,
      { id: `u-${list.length}`, dogId: MOCK_DOG.id, role: "user", createdAt, blocks: [{ type: "text", text }] },
      {
        id: `a-${list.length}`,
        dogId: MOCK_DOG.id,
        role: "assistant",
        createdAt,
        blocks: [{ type: "notice", tone: "info", text: "지금은 화면 미리보기라 입력한 문장을 처리하지 않아요." }],
      },
    ]);
  };

  const chatTitle = `${MOCK_DOG.name}와 대화`;
  const ongoingBar = <OngoingEpisodeBar episodes={ongoing} nowIso={MOCK_NOW} onClose={closeEpisode} />;
  const chatFooter = (autoFocus: boolean) => (
    <div className="space-y-2">
      {ongoingBar}
      <MessageComposer onSend={send} autoFocus={autoFocus} />
    </div>
  );
  const chat = (
    <Conversation
      messages={messages}
      entries={chatEntries}
      nowIso={MOCK_NOW}
      timeZone={MOCK_TIME_ZONE}
      actions={{ onEdit: setEditing, onPick: pick, onUndo: undo }}
    />
  );

  // 넓은 화면(lg 이상)은 왼쪽 기록 목록 + 오른쪽 채팅 패널, 좁은 화면은 입력창을 누르면 채팅 시트가 열린다
  return (
    <div className="h-dvh lg:mx-auto lg:grid lg:w-[92%] lg:max-w-[1200px] lg:grid-cols-[minmax(0,1fr)_min(40%,420px)]">
      <div className="flex h-full min-h-0 flex-col">
        <div className="shrink-0 bg-background lg:h-14">
          <div className="mx-auto w-[92%] lg:w-full lg:pr-4 lg:pl-3">
            <AppHeader dogName={MOCK_DOG.name} />
          </div>
        </div>

        <ScrollArea className="flex-1" viewportClassName="flex flex-col-reverse">
          <main className="ml-[calc((100%+0.875rem)*0.04)] w-[min(calc((100%+0.875rem)*0.92),calc(100%-(100%+0.875rem)*0.04))] space-y-4 pt-2 pb-4 lg:ml-0 lg:w-full lg:pb-8">
            {entries.length === 0 ? (
              <FirstRecordGuide onLoadSample={() => setEntries(MOCK_ENTRIES)} />
            ) : (
              <DateGroupedList entries={entries} nowIso={MOCK_NOW} timeZone={MOCK_TIME_ZONE} onSelect={setEditing} />
            )}
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
        timeZone={MOCK_TIME_ZONE}
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
