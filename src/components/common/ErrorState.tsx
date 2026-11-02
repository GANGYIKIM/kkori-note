/**
 * 불러오기에 실패한 자리. 문장과 "다시 시도" 버튼을 가운데에 둔다.
 * 쓸 때: 목록·대화를 불러오지 못했을 때.
 * 쓰지 않을 때: 요청 한도 같은 시스템 안내 → Banner. 불러왔지만 내용이 없을 때 → EmptyState.
 */
const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => {
  return (
    <div role="alert" className="rounded-2xl bg-surface px-5 py-10 text-center">
      <p className="font-bold">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 h-10 rounded-xl bg-accent/10 px-4 text-sm font-bold text-accent"
      >
        다시 시도
      </button>
    </div>
  );
};

export { ErrorState };
