import { startOfLocalDay } from "@/lib/domain/datetime";
import type { LogEntry } from "@/lib/domain/types";
import { DateGroupedList } from "./DateGroupedList";

const HOUR_MS = 60 * 60 * 1000;

/** 기록이 쌓였을 때의 목록 모습을 흐리게 보여줄 오늘 기록 세 개 */
const previewEntries = (nowIso: string, timeZone: string): LogEntry[] => {
  const dayStart = Date.parse(startOfLocalDay(nowIso, timeZone));
  const at = (hours: number) => new Date(dayStart + hours * HOUR_MS).toISOString();
  const base: Omit<LogEntry, "id" | "kindId" | "occurredAt" | "values" | "createdAt"> = {
    dogId: "preview",
    timePrecision: "exact",
    endedAt: null,
    durationSec: null,
    weather: null,
    rawText: "",
    attachmentIds: [],
    isDemo: false,
  };
  return [
    { ...base, id: "preview-meal", kindId: "meal", occurredAt: at(8), values: {}, createdAt: at(8) },
    { ...base, id: "preview-walk", kindId: "walk", occurredAt: at(8), values: {}, createdAt: at(8) },
    {
      ...base,
      id: "preview-poop",
      kindId: "poop",
      occurredAt: at(14 + 1 / 6),
      values: { stoolState: "soft", count: 1 },
      createdAt: at(14 + 1 / 6),
    },
  ];
};

/**
 * 기록이 하나도 없을 때의 메인 목록. 예시 문장과 쌓였을 때의 흐린 미리보기, 샘플 불러오기 (PRD R0-6, R10).
 * 이름을 정하기 전에는 인사와 이름을 알려 주는 문장, 정한 뒤에는 첫 기록 문장을 예시로 보여준다 (demo 브랜치)
 */
const FirstRecordGuide = ({
  nowIso,
  timeZone,
  dogName = null,
  onLoadSample,
}: {
  nowIso: string;
  timeZone: string;
  dogName?: string | null;
  onLoadSample?: () => void;
}) => {
  return (
    <div className="flex grow flex-col justify-center gap-10 py-10">
      <div className="space-y-3 text-center">
        <p className="text-xl font-bold">아직 기록이 없어요</p>
        <p className="text-[15px]/relaxed text-muted">
          {dogName ? "입력창에 이렇게 적어 보세요." : "처음이라면 인사와 함께 강아지 이름을 알려 주세요."}
          <br />
          <span className="font-bold text-foreground">
            &quot;{dogName ? "아침 8시에 밥 먹고 산책 다녀왔어" : "안녕, 우리집 강아지 이름은 곰순이야"}&quot;
          </span>
        </p>
        {onLoadSample ? (
          <button
            type="button"
            onClick={onLoadSample}
            className="mt-2 h-10 rounded-xl bg-accent/10 px-4 text-sm font-bold text-accent"
          >
            샘플 기록 불러오기
          </button>
        ) : null}
      </div>
      <div inert aria-hidden className="mask-b-from-30% opacity-40">
        <DateGroupedList entries={previewEntries(nowIso, timeZone)} nowIso={nowIso} timeZone={timeZone} />
      </div>
    </div>
  );
};

export { FirstRecordGuide };
