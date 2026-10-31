import type { Variant } from "@/components/preview/variant";
import * as Icons from "./Icons";

const variants: Variant[] = [
  {
    name: "전체 (기본 20px)",
    render: () => (
      <ul className="grid grid-cols-3 gap-3">
        {Object.entries(Icons).map(([name, Icon]) => (
          <li key={name} className="flex flex-col items-center gap-1.5">
            <Icon />
            <span className="text-[11px] text-muted">{name}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    name: "크기 16 · 20 · 24, 색은 글자색",
    render: () => (
      <div className="flex items-center gap-3 text-accent">
        <Icons.AlertIcon width={16} height={16} />
        <Icons.AlertIcon />
        <Icons.AlertIcon width={24} height={24} />
      </div>
    ),
  },
];

export { variants };
