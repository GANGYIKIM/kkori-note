import { formatDateHeading, groupByLocalDate } from "@/lib/domain/datetime";
import type { LogEntry } from "@/lib/domain/types";
import { EntryRow } from "./EntryRow";

/** 메인 화면의 기록 목록. 현지 날짜별로 묶고 최신이 위 (PRD R0, R2) */
const EntryList = ({
  entries,
  nowIso,
  timeZone,
  onSelect,
}: {
  entries: readonly LogEntry[];
  nowIso: string;
  timeZone: string;
  onSelect?: (entry: LogEntry) => void;
}) => {
  const groups = groupByLocalDate(entries, timeZone);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.dateKey} aria-label={formatDateHeading(group.dateKey, nowIso, timeZone)}>
          <h2 className="mb-1 px-3 text-sm font-bold text-muted">
            {formatDateHeading(group.dateKey, nowIso, timeZone)}
          </h2>
          <ul>
            {group.items.map((entry) => (
              <li key={entry.id}>
                <EntryRow entry={entry} timeZone={timeZone} onSelect={onSelect} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export { EntryList };
