import { LABELS, type RiskGrade } from "@/lib/domain/values";
import { RISK_COPY_EXAMPLES } from "@/lib/mock/data";
import type { Variant } from "@/components/preview/variant";
import { RiskBanner } from "./RiskBanner";

const GRADES: RiskGrade[] = ["high", "caution", "low"];

const variants: Variant[] = GRADES.map((grade) => ({
  name: LABELS.riskGrade[grade],
  note: grade === "high" ? "모드별 문장은 PRD 장면 탭에 있어요." : undefined,
  render: () => <RiskBanner grade={grade} {...RISK_COPY_EXAMPLES[grade].neutral} />,
}));

export { variants };
