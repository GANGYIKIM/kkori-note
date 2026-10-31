import type { ReactNode } from "react";

/**
 * 짧은 분류 라벨. 색은 className으로 넘긴다.
 * 쓸 때: 기록 종류처럼 색으로 구분하는 짧은 분류. 누를 수 없다.
 * 쓰지 않을 때: 눌러서 고르는 선택지 → 버튼. 문장으로 된 안내 → Banner.
 */
const Tag = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  return (
    <span className={`inline-flex h-6 shrink-0 items-center rounded-md px-2 text-xs font-bold ${className}`}>
      {children}
    </span>
  );
};

export { Tag };
