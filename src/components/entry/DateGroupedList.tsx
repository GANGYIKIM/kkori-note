import { formatDateHeading, formatEntryTime, groupByLocalDate } from "@/lib/domain/datetime";
import { summarizeEntry } from "@/lib/domain/entry-summary";
import type { LogEntry } from "@/lib/domain/types";
import { kindLabel } from "@/lib/domain/kinds";
import { kindStyle } from "@/lib/domain/values";
import { ListRow } from "@/components/common/ListRow";
import { Tag } from "@/components/common/Tag";

/** 메인 화면의 기록 목록. 현지 날짜별로 묶고 오래된 것이 위, 하루 전체 기록은 그날 맨 아래 (PRD R0-2, R11) */
const DateGroupedList = ({
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
                <ListRow
                  time={
                    <>
                      {formatEntryTime(entry, timeZone)}
                      {entry.timePrecision === "estimated" ? (
                        <span className="block text-[11px] leading-none">추정</span>
                      ) : null}
                    </>
                  }
                  tag={<Tag className={kindStyle(entry.kindId).tag}>{kindLabel(entry.kindId)}</Tag>}
                  trailing={entry.isDemo ? "샘플" : null}
                  onClick={onSelect ? () => onSelect(entry) : undefined}
                >
                  {summarizeEntry(entry).join(" · ") ||
                    (entry.kindId === "poop" ? <span className="text-muted">상태 미입력</span> : null)}
                </ListRow>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export { DateGroupedList };
