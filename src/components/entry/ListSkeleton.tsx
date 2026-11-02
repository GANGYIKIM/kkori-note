import { Skeleton } from "@/components/common/Skeleton";

/** 기록 목록을 불러오는 동안 보이는 기록 줄 모양 회색 자리 3줄 (PRD R0-6) */
const ListSkeleton = () => {
  return (
    <ul aria-label="기록을 불러오는 중" className="space-y-1">
      {[0, 1, 2].map((i) => (
        <li key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-6 w-12 rounded-md" />
          <Skeleton className="h-4 flex-1" />
        </li>
      ))}
    </ul>
  );
};

export { ListSkeleton };
