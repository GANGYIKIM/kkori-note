import type { ReactNode } from "react";

/**
 * 보여줄 내용이 없는 자리를 채우는 안내.
 * 쓸 때: 목록에 보여줄 것이 없을 때. 다음 행동을 action으로 함께 둔다 (예: 첫 기록 전 목록).
 * 쓰지 않을 때: 오류·요청 한도 안내 → Banner.
 */
const EmptyState = ({ title, description, action }: { title: string; description?: string; action?: ReactNode }) => {
  return (
    <div className="rounded-2xl bg-surface px-5 py-10 text-center">
      <p className="font-bold">{title}</p>
      {description ? <p className="mt-2 text-sm/relaxed text-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
};

export { EmptyState };
