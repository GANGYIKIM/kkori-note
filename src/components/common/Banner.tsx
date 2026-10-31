import type { ReactNode } from "react";

type BannerTone = "neutral" | "danger" | "warning" | "success";

const TONE_STYLES: Record<BannerTone, { box: string; icon: string }> = {
  neutral: { box: "bg-surface", icon: "" },
  danger: { box: "bg-danger/10 text-danger", icon: "text-danger" },
  warning: { box: "bg-warning/10 text-warning", icon: "text-warning" },
  success: { box: "bg-success/10 text-success", icon: "text-success" },
};

/**
 * 아이콘과 문장을 담는 안내 띠. title이 있으면 tone 색 배경의 큰 띠, 없으면 회색 배경에 아이콘만 tone 색인 짧은 띠다.
 * 쓸 때: 오류·요청 한도 같은 시스템 안내(title 없음), 위험 등급 안내(title 있음, chat/RiskBanner를 거쳐서).
 * 쓰지 않을 때: 잠깐 떴다 사라지는 알림 → 토스트(아직 없음). 기록 내용 표시 → ListRow.
 */
const Banner = ({
  tone = "neutral",
  icon,
  label,
  title,
  children,
  role,
}: {
  tone?: BannerTone;
  icon: ReactNode;
  label?: string;
  title?: string;
  children: ReactNode;
  role?: "alert" | "status";
}) => {
  const style = TONE_STYLES[tone];

  if (!title) {
    return (
      <div role={role} className="flex items-start gap-2 rounded-xl bg-surface px-3 py-2.5 text-sm text-muted">
        <span className={`mt-0.5 flex shrink-0 ${style.icon}`}>{icon}</span>
        <p>{children}</p>
      </div>
    );
  }

  return (
    <div role={role} className={`flex gap-3 rounded-2xl px-4 py-3 ${style.box}`}>
      <span className="mt-0.5 flex shrink-0">{icon}</span>
      <div className="text-foreground">
        {label ? <p className="text-xs font-bold opacity-80">{label}</p> : null}
        <p className="font-bold">{title}</p>
        <p className="mt-1 text-sm/relaxed text-muted">{children}</p>
      </div>
    </div>
  );
};

export { Banner };
export type { BannerTone };
