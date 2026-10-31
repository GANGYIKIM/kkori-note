import Link from "next/link";
import { BackIcon } from "@/components/common/Icons";

const TABS = [
  { id: "components", href: "/preview", label: "컴포넌트" },
  { id: "cases", href: "/preview/cases", label: "PRD 장면" },
] as const;

/** 미리보기 상단. 컴포넌트 탭과 PRD 장면 탭을 오간다 (ADR-0010) */
const PreviewHeader = ({ active }: { active: (typeof TABS)[number]["id"] }) => {
  return (
    <header className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 backdrop-blur-sm">
      <div className="flex h-14 items-center gap-1">
        <Link href="/" aria-label="메인으로" className="-ml-2 rounded-lg p-2 text-muted hover:bg-surface">
          <BackIcon />
        </Link>
        <h1 className="text-lg font-bold">미리보기</h1>
      </div>
      <nav aria-label="미리보기 탭" className="flex gap-5 border-b border-border">
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={active === tab.id ? "page" : undefined}
            className={`-mb-px border-b-2 pb-2 text-sm font-bold ${
              active === tab.id ? "border-accent text-foreground" : "border-transparent text-muted"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export { PreviewHeader };
