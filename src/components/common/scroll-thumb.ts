/** 오버레이 스크롤바 막대의 크기·위치 계산 (ADR-0015) */

const MIN_THUMB = 24;

interface ScrollBox {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

/**
 * 막대 크기와 위에서부터의 위치(px). 스크롤할 것이 없으면 null.
 * reversed(flex-col-reverse)는 맨 아래가 scrollTop 0이고 위로 갈수록 음수다.
 */
const thumbMetrics = ({
  scrollTop,
  scrollHeight,
  clientHeight,
  reversed,
}: ScrollBox & { reversed: boolean }): { size: number; offset: number } | null => {
  const range = scrollHeight - clientHeight;
  if (range <= 0) return null;
  const size = Math.max(MIN_THUMB, (clientHeight * clientHeight) / scrollHeight);
  const fromTop = reversed ? scrollTop + range : scrollTop;
  const progress = Math.min(1, Math.max(0, fromTop / range));
  return { size, offset: progress * (clientHeight - size) };
};

/** 막대를 dragPx만큼 끌었을 때 바꿀 scrollTop 양 */
const scrollDeltaForDrag = (
  dragPx: number,
  { scrollHeight, clientHeight, size }: { scrollHeight: number; clientHeight: number; size: number },
): number => {
  const track = clientHeight - size;
  return track <= 0 ? 0 : (dragPx * (scrollHeight - clientHeight)) / track;
};

export { thumbMetrics, scrollDeltaForDrag };
