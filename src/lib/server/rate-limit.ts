/**
 * 요청 횟수 제한 (PRD R9).
 *
 * 주의: 이 구현은 서버 인스턴스 메모리에 카운트를 둔다. Vercel 같은 서버리스 환경에서는
 * 인스턴스가 여러 개이거나 재시작될 수 있어 "완전한" 제한은 아니다.
 * 과제 데모 수준의 비용 방어용이며, 더 엄격하게 하려면 외부 저장소(예: Redis/KV)로 교체한다.
 * 그래서 Store 인터페이스 뒤에 숨겨 두었다.
 */

interface RateLimitStore {
  /** key의 현재 윈도우 카운트를 1 올리고 올린 뒤의 값과 윈도우 종료 시각(ms)을 돌려준다. */
  hit(key: string, windowMs: number, now: number): { count: number; resetAt: number };
}

const createMemoryStore = (): RateLimitStore => {
  const buckets = new Map<string, { count: number; resetAt: number }>();
  return {
    hit(key, windowMs, now) {
      // 만료된 버킷 정리 (메모리 무한 증가 방지)
      if (buckets.size > 5000) {
        for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
      }
      const current = buckets.get(key);
      if (!current || current.resetAt <= now) {
        const fresh = { count: 1, resetAt: now + windowMs };
        buckets.set(key, fresh);
        return fresh;
      }
      current.count += 1;
      return current;
    },
  };
};

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** 제한이 풀리는 시각(ms epoch) */
  resetAt: number;
}

const checkRateLimit = (
  store: RateLimitStore,
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult => {
  const { count, resetAt } = store.hit(key, windowMs, now);
  return { allowed: count <= limit, remaining: Math.max(0, limit - count), resetAt };
};

export { createMemoryStore, checkRateLimit };
export type { RateLimitStore, RateLimitResult };
