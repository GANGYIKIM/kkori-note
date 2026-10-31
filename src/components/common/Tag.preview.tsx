import { ENTRY_KINDS, KIND_STYLES, LABELS } from "@/lib/domain/values";
import type { Variant } from "@/components/preview/variant";
import { Tag } from "./Tag";

const variants: Variant[] = [
  {
    name: "기록 종류별 색",
    render: () => (
      <div className="flex flex-wrap gap-1.5">
        {ENTRY_KINDS.map((kind) => (
          <Tag key={kind} className={KIND_STYLES[kind].tag}>
            {LABELS.entryKind[kind]}
          </Tag>
        ))}
      </div>
    ),
  },
];

export { variants };
