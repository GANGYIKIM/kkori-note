import { DEFAULT_KINDS } from "@/lib/domain/kinds";
import { kindStyle } from "@/lib/domain/values";
import type { Variant } from "@/components/preview/variant";
import { Tag } from "./Tag";

const variants: Variant[] = [
  {
    name: "기록 종류별 색",
    render: () => (
      <div className="flex flex-wrap gap-1.5">
        {DEFAULT_KINDS.map((kind) => (
          <Tag key={kind.id} className={kindStyle(kind.id).tag}>
            {kind.label}
          </Tag>
        ))}
      </div>
    ),
  },
];

export { variants };
