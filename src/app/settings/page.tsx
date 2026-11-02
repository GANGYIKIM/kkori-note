import Link from "next/link";
import { BackIcon } from "@/components/common/Icons";
import { ScrollArea } from "@/components/common/ScrollArea";
import { ProfileForm } from "@/components/settings/ProfileForm";

export default function SettingsPage() {
  return (
    <div className="flex h-dvh flex-col">
      <header className="mx-auto flex h-14 w-[92%] max-w-[672px] shrink-0 items-center gap-1">
        <Link href="/" aria-label="뒤로" className="-ml-2 rounded-lg p-2 text-muted hover:bg-surface">
          <BackIcon />
        </Link>
        <h1 className="text-lg font-bold">설정</h1>
      </header>

      <ScrollArea className="flex-1">
        <div className="ml-[max(calc((100%+0.875rem)*0.04),calc((100%+0.875rem-672px)/2))] w-[min(calc((100%+0.875rem)*0.92),calc(100%-(100%+0.875rem)*0.04))] max-w-[672px] space-y-8 pt-2 pb-10">
          <ProfileForm />

          <section className="space-y-2 rounded-2xl bg-surface p-4">
            <h2 className="font-bold">꼭 알아 주세요</h2>
            <p className="text-sm/relaxed text-muted">
              꼬리노트는 진단 도구가 아니에요. 진단, 처방, 약 용량은 안내하지 않아요. 응급이 의심되면 가까운 24시간
              동물병원에 바로 연락해 주세요.
            </p>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
