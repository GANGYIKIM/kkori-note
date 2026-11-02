import { Skeleton } from "@/components/common/Skeleton";

/** 대화를 불러오는 동안 보이는 말풍선 모양 회색 자리 2개 (PRD R0-6) */
const ConversationSkeleton = () => {
  return (
    <div aria-label="대화를 불러오는 중" className="space-y-3">
      <Skeleton className="h-12 w-3/5 rounded-2xl rounded-bl-md" />
      <Skeleton className="ml-auto h-10 w-2/5 rounded-2xl rounded-br-md" />
    </div>
  );
};

export { ConversationSkeleton };
