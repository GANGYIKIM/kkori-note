import type { ComponentType, SVGProps } from "react";
import { LABELS, type RiskGrade } from "@/lib/domain/values";
import { Banner, type BannerTone } from "@/components/common/Banner";
import { AlertIcon, CheckCircleIcon, InfoIcon } from "@/components/common/Icons";

const GRADE_STYLES: Record<RiskGrade, { tone: BannerTone; Icon: ComponentType<SVGProps<SVGSVGElement>> }> = {
  high: { tone: "danger", Icon: AlertIcon },
  caution: { tone: "warning", Icon: InfoIcon },
  low: { tone: "success", Icon: CheckCircleIcon },
};

/** 위험 등급 안내. 등급은 코드(assess)가 정하고, 문장은 등급 × 모드 고정 문장이다 (PRD R6) */
const RiskBanner = ({ grade, title, body }: { grade: RiskGrade; title: string; body: string }) => {
  const { tone, Icon } = GRADE_STYLES[grade];
  return (
    <Banner
      tone={tone}
      icon={<Icon />}
      label={LABELS.riskGrade[grade]}
      title={title}
      role={grade === "high" ? "alert" : "status"}
    >
      {body}
    </Banner>
  );
};

export { RiskBanner };
