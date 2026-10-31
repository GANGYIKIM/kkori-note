import type { Variant } from "@/components/preview/variant";
import { ComposerLauncher, MessageComposer } from "./MessageComposer";

const variants: Variant[] = [
  { name: "MessageComposer (채팅 안 입력창)", render: () => <MessageComposer onSend={() => {}} /> },
  { name: "ComposerLauncher (메인의 열기 버튼)", render: () => <ComposerLauncher onOpen={() => {}} /> },
];

export { variants };
