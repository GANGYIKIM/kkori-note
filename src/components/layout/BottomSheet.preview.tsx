import { useState } from "react";
import { MessageComposer } from "@/components/chat/MessageComposer";
import type { Variant } from "@/components/preview/variant";
import { BottomSheet } from "./BottomSheet";

const SheetDemo = ({ full }: { full: boolean }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="h-10 rounded-xl bg-surface px-4 text-sm font-bold">
        시트 열기
      </button>
      <BottomSheet
        open={open}
        title={full ? "초코와 대화" : "기록 고치기"}
        onClose={() => setOpen(false)}
        full={full}
        footer={full ? <MessageComposer onSend={() => {}} /> : undefined}
      >
        <p className="text-sm text-muted">바깥을 누르거나 Esc를 누르면 닫혀요.</p>
      </BottomSheet>
    </>
  );
};

const variants: Variant[] = [
  { name: "내용 높이만큼 (칩 수정)", render: () => <SheetDemo full={false} /> },
  { name: "full + footer (채팅)", render: () => <SheetDemo full /> },
];

export { variants };
