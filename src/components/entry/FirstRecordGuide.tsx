import { EmptyState } from "@/components/common/EmptyState";

/** 기록이 하나도 없을 때의 메인 목록. 첫 기록 예시 문장과 샘플 불러오기 (PRD R0-6, R10) */
const FirstRecordGuide = ({ onLoadSample }: { onLoadSample: () => void }) => {
  return (
    <EmptyState
      title="아직 기록이 없어요"
      description={'아래 입력창에 이렇게 적어 보세요.\n"방금 배변했는데 무른 편이야"'}
      action={
        <button
          type="button"
          onClick={onLoadSample}
          className="h-10 rounded-xl bg-accent/10 px-4 text-sm font-bold text-accent"
        >
          샘플 기록 불러오기
        </button>
      }
    />
  );
};

export { FirstRecordGuide };
