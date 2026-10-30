import { LABELS, type EntryKind } from "@/lib/domain/values";

/** 기록 종류별 색. Tailwind가 클래스를 찾을 수 있게 전체 클래스명을 그대로 적는다 */
export const KIND_STYLES: Record<EntryKind, { tag: string; dot: string }> = {
  poop: { tag: "bg-kind-poop/10 text-kind-poop", dot: "bg-kind-poop" },
  meal: { tag: "bg-kind-meal/10 text-kind-meal", dot: "bg-kind-meal" },
  snack: { tag: "bg-kind-snack/10 text-kind-snack", dot: "bg-kind-snack" },
  walk: { tag: "bg-kind-walk/10 text-kind-walk", dot: "bg-kind-walk" },
  picked_up: { tag: "bg-kind-picked-up/10 text-kind-picked-up", dot: "bg-kind-picked-up" },
  limp: { tag: "bg-kind-limp/10 text-kind-limp", dot: "bg-kind-limp" },
  seizure: { tag: "bg-kind-seizure/10 text-kind-seizure", dot: "bg-kind-seizure" },
  thunder_fear: { tag: "bg-kind-thunder/10 text-kind-thunder", dot: "bg-kind-thunder" },
  note: { tag: "bg-kind-note/10 text-kind-note", dot: "bg-kind-note" },
};

export function KindTag({ kind }: { kind: EntryKind }) {
  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center rounded-md px-2 text-xs font-bold ${KIND_STYLES[kind].tag}`}
    >
      {LABELS.entryKind[kind]}
    </span>
  );
}
