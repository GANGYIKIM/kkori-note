import { LABELS, type RiskGrade } from "@/lib/domain/values";
import { AlertIcon, CheckCircleIcon, InfoIcon } from "@/components/Icons";

const GRADE_STYLES: Record<RiskGrade, { box: string; icon: typeof AlertIcon }> = {
  high: { box: "bg-danger/10 text-danger", icon: AlertIcon },
  caution: { box: "bg-warning/10 text-warning", icon: InfoIcon },
  low: { box: "bg-success/10 text-success", icon: CheckCircleIcon },
};

/** 위험 등급 안내. 등급은 코드(assess)가 정하고, 문장은 등급 × 모드 고정 문장이다 (PRD R6) */
const RiskBanner = ({ grade, title, body }: { grade: RiskGrade; title: string; body: string }) => {
  const { box, icon: Icon } = GRADE_STYLES[grade];
  return (
    <div role={grade === "high" ? "alert" : "status"} className={`flex gap-3 rounded-2xl px-4 py-3 ${box}`}>
      <Icon className="mt-0.5 shrink-0" />
      <div className="text-foreground">
        <p className="text-xs font-bold opacity-80">{LABELS.riskGrade[grade]}</p>
        <p className="font-bold">{title}</p>
        <p className="mt-1 text-sm/relaxed text-muted">{body}</p>
      </div>
    </div>
  );
};

export { RiskBanner };
