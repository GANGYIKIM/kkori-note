import type { ReactNode } from "react";

/**
 * 시각 · 태그 · 내용 · 꼬리표를 나란히 두는 목록 한 줄. onClick이 있으면 버튼이 되고, wideTime은 시각 칸에 날짜까지 넣을 때 쓴다.
 * 쓸 때: 시각으로 시작하는 목록 한 줄 (기록 목록, 근거 카드).
 * 쓰지 않을 때: 시각 없는 목록, 칩 여러 개를 나열하는 카드 → 그 화면에서 직접 구성.
 * @example
 * <ListRow time="08:30" tag={<Tag className={KIND_STYLES.meal.tag}>식사</Tag>} trailing="샘플" onClick={open}>
 *   사료 반 컵
 * </ListRow>
 */
const ListRow = ({
  time,
  tag,
  children,
  trailing,
  onClick,
  compact = false,
  wideTime = false,
}: {
  time: ReactNode;
  tag?: ReactNode;
  children?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
  compact?: boolean;
  wideTime?: boolean;
}) => {
  const content = (
    <>
      <span className={`shrink-0 text-sm text-muted tabular-nums ${wideTime ? "w-[76px]" : "w-11"}`}>{time}</span>
      {tag}
      <span className="min-w-0 flex-1 truncate text-[15px]">{children}</span>
      {trailing ? <span className="shrink-0 text-[11px] text-muted">{trailing}</span> : null}
    </>
  );

  const className = `flex w-full items-center gap-3 text-left ${compact ? "py-2" : "rounded-xl p-3"}`;

  if (!onClick) return <div className={className}>{content}</div>;
  return (
    <button type="button" onClick={onClick} className={`${className} hover:bg-surface active:bg-surface-strong`}>
      {content}
    </button>
  );
};

export { ListRow };
