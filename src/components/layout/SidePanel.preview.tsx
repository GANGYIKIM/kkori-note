import { MessageComposer } from "@/components/chat/MessageComposer";
import type { Variant } from "@/components/preview/variant";
import { SidePanel } from "./SidePanel";

const variants: Variant[] = [
  {
    name: "제목 · 본문 · 하단 입력창",
    note: "실제로는 넓은 화면에서 화면 높이만큼 늘어나요. 여기서는 높이를 줄였어요.",
    render: () => (
      <div className="h-72">
        <SidePanel title="초코와 대화" footer={<MessageComposer onSend={() => {}} />}>
          <p className="text-sm text-muted">본문이 길어지면 이 칸만 스크롤돼요.</p>
        </SidePanel>
      </div>
    ),
  },
];

export { variants };
