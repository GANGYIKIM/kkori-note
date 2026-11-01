import { kindLabel } from "@/lib/domain/kinds";
import { kindStyle } from "@/lib/domain/values";
import type { Variant } from "@/components/preview/variant";
import { ListRow } from "./ListRow";
import { Tag } from "./Tag";

const mealTag = <Tag className={kindStyle("meal").tag}>{kindLabel("meal")}</Tag>;

const variants: Variant[] = [
  {
    name: "기본 (누를 수 없음)",
    render: () => (
      <ListRow time="08:30" tag={mealTag}>
        사료 반 컵
      </ListRow>
    ),
  },
  {
    name: "onClick + 꼬리표",
    render: () => (
      <ListRow time="08:30" tag={mealTag} trailing="샘플" onClick={() => {}}>
        사료 반 컵
      </ListRow>
    ),
  },
  {
    name: "compact + wideTime",
    render: () => (
      <ListRow time="10/28 08:30" tag={mealTag} compact wideTime>
        사료 반 컵
      </ListRow>
    ),
  },
  { name: "내용 없음", render: () => <ListRow time="11:40" tag={mealTag} /> },
];

export { variants };
