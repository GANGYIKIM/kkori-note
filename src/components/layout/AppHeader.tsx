import Link from "next/link";
import { SettingsIcon } from "@/components/common/Icons";

/** 메인 상단. 강아지 이름과 설정 아이콘 (PRD R0) */
const AppHeader = ({ dogName }: { dogName: string | null }) => {
  return (
    <header className="flex h-14 items-center justify-between">
      <p className="text-lg font-bold">
        꼬리노트
        {dogName ? <span className="ml-2 text-base font-normal text-muted">{dogName}</span> : null}
      </p>
      <Link href="/settings" aria-label="설정" className="-mr-2 rounded-lg p-2 text-muted hover:bg-surface">
        <SettingsIcon />
      </Link>
    </header>
  );
};

export { AppHeader };
