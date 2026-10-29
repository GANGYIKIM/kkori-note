import { formatDateHeading, formatDuration, formatLocalTime, localDateKey } from "@/lib/domain/datetime";
import type { LogEntry } from "@/lib/domain/types";
import { LABELS } from "@/lib/domain/values";
import { KIND_STYLES } from "../KindTag";

/** 에피소드 모아 보기 카드. 최신이 위인 세로 타임라인 (PRD R4 수락 기준) */
export function EpisodeCard({
  episodes,
  nowIso,
  timeZone,
  onSelect,
}: {
  episodes: readonly LogEntry[];
  nowIso: string;
  timeZone: string;
  onSelect?: (entry: LogEntry) => void;
}) {
  const sorted = [...episodes].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  return (
    <ol className="rounded-2xl border border-border bg-background px-3 py-3">
      {sorted.map((episode, index) => (
        <li key={episode.id} className="relative flex gap-3 pb-4 last:pb-0">
          {index < sorted.length - 1 ? <span className="absolute left-[5px] top-4 h-full w-px bg-border" /> : null}
          <span className={`mt-1.5 size-[11px] shrink-0 rounded-full ${KIND_STYLES[episode.kind].dot}`} />
          <button type="button" onClick={() => onSelect?.(episode)} className="flex-1 text-left">
            <p className="text-xs text-muted">
              {formatDateHeading(localDateKey(episode.occurredAt, timeZone), nowIso, timeZone)} ·{" "}
              {formatLocalTime(episode.occurredAt, timeZone)}
            </p>
            <p className="text-[15px]">
              <span className="font-bold">{LABELS.entryKind[episode.kind]}</span>{" "}
              {episode.durationSec !== null ? formatDuration(episode.durationSec) : episode.endedAt === null ? "진행 중" : "지속시간 모름"}
              {episode.intensity ? ` · 강도 ${LABELS.intensity[episode.intensity]}` : ""}
            </p>
          </button>
        </li>
      ))}
    </ol>
  );
}
