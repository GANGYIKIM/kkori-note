import type { ReactNode } from "react";

/** 미리보기에 그릴 상태 하나. 컴포넌트 옆 `X.preview.tsx`에 모은다 (ADR-0010) */
interface Variant {
  name: string;
  note?: string;
  render: () => ReactNode;
}

export type { Variant };
