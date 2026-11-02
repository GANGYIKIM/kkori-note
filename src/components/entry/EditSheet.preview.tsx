import { useState } from "react";
import { LogEntrySchema, type LogEntry } from "@/lib/domain/types";
import { kindLabel } from "@/lib/domain/kinds";
import { MOCK_ENTRY_MAP as map, MOCK_TIME_ZONE as tz } from "@/lib/mock/data";
import type { Variant } from "@/components/preview/variant";
import { EditForm, EditSheet } from "./EditSheet";

const SAMPLE_IDS = ["e-choco", "e-poop-unknown", "e-27-limp", "e-28-walk"];

const FormDemo = () => {
  const [draft, setDraft] = useState<LogEntry>(map["e-choco"]);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {SAMPLE_IDS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setDraft(LogEntrySchema.parse(map[id]))}
            className="rounded-full bg-surface px-3 py-1 text-sm"
          >
            {kindLabel(map[id].kindId)} 예시
          </button>
        ))}
      </div>
      <EditForm key={draft.id} entry={draft} timeZone={tz} onChange={setDraft} />
    </div>
  );
};

const SheetDemo = ({ entryId }: { entryId: string }) => {
  const [entry, setEntry] = useState<LogEntry | null>(null);
  const close = () => setEntry(null);
  return (
    <>
      <button
        type="button"
        onClick={() => setEntry(map[entryId])}
        className="h-10 rounded-xl bg-surface px-4 text-sm font-bold"
      >
        시트 열기
      </button>
      <EditSheet entry={entry} timeZone={tz} onClose={close} onSave={close} onDelete={close} />
    </>
  );
};

const variants: Variant[] = [
  { name: "EditForm · 종류에 따라 칸이 바뀜", render: () => <FormDemo /> },
  { name: "EditSheet · 시트 + 삭제 · 완료", render: () => <SheetDemo entryId="e-poop-soft" /> },
  { name: "EditSheet · 칸이 많아 시트 안에서 스크롤", render: () => <SheetDemo entryId="e-choco" /> },
];

export { variants };
