import type { Variant } from "@/components/preview/variant";
import { ProfileForm } from "./ProfileForm";

const variants: Variant[] = [
  {
    name: "저장된 프로필 불러옴",
    note: "브라우저 저장소를 직접 읽고 써요. 저장하면 실제 프로필이 바뀌어요. 불러오는 중·오류 상태는 여기서 바꿀 수 없어요.",
    render: () => <ProfileForm />,
  },
];

export { variants };
