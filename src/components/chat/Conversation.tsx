import type { ChatBlock, ChatMessage, LogEntry, UncertainField } from "@/lib/domain/types";
import { EntryChipCard } from "./EntryChipCard";
import { EpisodeCard } from "./EpisodeCard";
import { EvidenceCard } from "./EvidenceCard";
import { Banner } from "@/components/common/Banner";
import { AlertIcon, InfoIcon } from "@/components/common/Icons";
import { RiskBanner } from "./RiskBanner";

interface ChatActions {
  onEdit?: (entry: LogEntry) => void;
  onPick?: (entryId: string, field: UncertainField["field"], value: string) => void;
  onUndo?: (entryIds: string[]) => void;
  onExpand?: () => void;
}

/** 채팅 대화. 사용자 말은 오른쪽 말풍선, 앱 응답은 블록을 순서대로 쌓는다 (PRD R0) */
const Conversation = ({
  messages,
  entries,
  nowIso,
  timeZone,
  actions = {},
}: {
  messages: readonly ChatMessage[];
  entries: Record<string, LogEntry>;
  nowIso: string;
  timeZone: string;
  actions?: ChatActions;
}) => {
  return (
    <ol className="space-y-4">
      {messages.map((message) =>
        message.role === "user" ? (
          <li key={message.id} className="flex justify-end">
            <p className="max-w-[80%] rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-[15px] text-accent-foreground">
              {message.blocks.map((b) => (b.type === "text" ? b.text : "")).join("")}
            </p>
          </li>
        ) : (
          <li key={message.id} className="max-w-[92%] space-y-2">
            {message.blocks.map((block, index) => (
              <Block
                key={index}
                block={block}
                entries={entries}
                nowIso={nowIso}
                timeZone={timeZone}
                actions={actions}
              />
            ))}
          </li>
        ),
      )}
    </ol>
  );
};

const Block = ({
  block,
  entries,
  nowIso,
  timeZone,
  actions,
}: {
  block: ChatBlock;
  entries: Record<string, LogEntry>;
  nowIso: string;
  timeZone: string;
  actions: ChatActions;
}) => {
  const pick = (ids: readonly string[]) => ids.map((id) => entries[id]).filter((e): e is LogEntry => e !== undefined);

  switch (block.type) {
    case "text":
      return (
        <p className="w-fit rounded-2xl rounded-bl-md bg-surface px-4 py-2.5 text-[15px] leading-relaxed">
          {block.text}
        </p>
      );
    case "entries":
      return (
        <EntryChipCard
          entries={pick(block.entryIds)}
          uncertain={block.uncertain}
          undone={block.undone}
          timeZone={timeZone}
          onEdit={actions.onEdit}
          onPick={actions.onPick}
          onUndo={actions.onUndo}
        />
      );
    case "evidence":
      return (
        <EvidenceCard
          rangeLabel={block.rangeLabel}
          summary={block.summary}
          entries={pick(block.entryIds)}
          canExpand={block.canExpand}
          timeZone={timeZone}
          onSelect={actions.onEdit}
          onExpand={actions.onExpand}
        />
      );
    case "episodes":
      return (
        <EpisodeCard episodes={pick(block.entryIds)} nowIso={nowIso} timeZone={timeZone} onSelect={actions.onEdit} />
      );
    case "risk":
      return <RiskBanner grade={block.grade} title={block.title} body={block.body} />;
    case "notice":
      return (
        <Banner
          tone={block.tone === "error" ? "danger" : "neutral"}
          icon={block.tone === "error" ? <AlertIcon width={16} height={16} /> : <InfoIcon width={16} height={16} />}
        >
          {block.text}
        </Banner>
      );
  }
};

export { Conversation };
export type { ChatActions };
