import type { Variant } from "@/components/preview/variant";
import { AlertIcon, CheckCircleIcon, InfoIcon } from "./Icons";
import { Banner } from "./Banner";

const variants: Variant[] = [
  {
    name: "title 없음 · neutral",
    render: () => (
      <Banner icon={<InfoIcon width={16} height={16} />}>지금은 화면 미리보기라 입력한 문장을 처리하지 않아요.</Banner>
    ),
  },
  {
    name: "title 없음 · danger",
    render: () => (
      <Banner tone="danger" icon={<AlertIcon width={16} height={16} />}>
        오늘 사용할 수 있는 AI 상담 횟수를 모두 사용했어요. 기록은 계속 남길 수 있어요.
      </Banner>
    ),
  },
  {
    name: "title 있음 · danger",
    render: () => (
      <Banner tone="danger" icon={<AlertIcon />} label="라벨" title="제목 문장이에요">
        본문 문장이에요.
      </Banner>
    ),
  },
  {
    name: "title 있음 · warning",
    render: () => (
      <Banner tone="warning" icon={<InfoIcon />} label="라벨" title="제목 문장이에요">
        본문 문장이에요.
      </Banner>
    ),
  },
  {
    name: "title 있음 · success",
    render: () => (
      <Banner tone="success" icon={<CheckCircleIcon />} label="라벨" title="제목 문장이에요">
        본문 문장이에요.
      </Banner>
    ),
  },
];

export { variants };
