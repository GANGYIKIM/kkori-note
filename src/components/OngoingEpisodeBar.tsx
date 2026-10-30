import { elapsedMinutes } from "@/lib/domain/datetime";
import type { LogEntry } from "@/lib/domain/types";
import { LABELS } from "@/lib/domain/values";
import { KIND_STYLES } from "./KindTag";

/** 메인 위쪽 "진행 중" 띠. 열린 에피소드마다 한 줄, [끝] 버튼으로 닫는다 (PRD R1) */
export function OngoingEpisodeBar({
  episodes,
  nowIso,
  onClose,
}: {
  episodes: readonly LogEntry[];
  nowIso: string;
  onClose?: (entry: LogEntry) => void;
}) {
  if (episodes.length === 0) return null;
  return (
    <ul className="space-y-2">
      {episodes.map((episode) => (
        <li
          key={episode.id}
          className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 shadow-sm"
        >
          <span className="relative flex size-2.5">
            <span
              className={`absolute inline-flex size-full animate-ping rounded-full opacity-60 ${KIND_STYLES[episode.kind].dot}`}
            />
            <span className={`relative inline-flex size-2.5 rounded-full ${KIND_STYLES[episode.kind].dot}`} />
          </span>
          <p className="flex-1 text-sm">
            <span className="font-bold">{LABELS.entryKind[episode.kind]}</span> 진행 중 ·{" "}
            <span className="tabular-nums">{elapsedMinutes(episode.occurredAt, nowIso)}분째</span>
          </p>
          <button
            type="button"
            onClick={() => onClose?.(episode)}
            className="h-8 rounded-lg bg-surface-strong px-3 text-sm font-bold"
          >
            끝
          </button>
        </li>
      ))}
    </ul>
  );
}
