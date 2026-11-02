/**
 * 불러오는 동안 내용 자리를 채우는 회색 자리. 크기와 모양은 className으로 정한다.
 * 쓸 때: 데이터를 불러오는 동안 목록·말풍선 모양을 미리 보여줄 때.
 * 쓰지 않을 때: 불러오기가 끝났는데 내용이 없을 때 → EmptyState.
 */
const Skeleton = ({ className = "" }: { className?: string }) => {
  return <span aria-hidden className={`block animate-pulse rounded-lg bg-surface ${className}`} />;
};

export { Skeleton };
