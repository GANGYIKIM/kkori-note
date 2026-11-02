import Link from "next/link";
import { BackIcon } from "@/components/common/Icons";
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

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-[92%] max-w-[672px] space-y-8 pt-2 pb-10">
          <ProfileForm />

          <section className="space-y-3">
            <h2 className="font-bold">샘플 기록</h2>
            <p className="text-sm text-muted">
              최근 2주치 샘플 기록을 넣어 앱을 바로 체험해 볼 수 있어요. 직접 남긴 기록은 지우지 않아요.
            </p>
            <div className="flex gap-2">
              <button type="button" className="h-11 flex-1 rounded-xl bg-accent/10 text-sm font-bold text-accent">
                샘플 기록 불러오기
              </button>
              <button type="button" className="h-11 flex-1 rounded-xl bg-surface text-sm font-bold">
                샘플만 지우기
              </button>
            </div>
            <p className="text-xs text-muted">화면 미리보기 단계라 아직 동작하지 않아요.</p>
          </section>

          <section className="space-y-2 rounded-2xl bg-surface p-4">
            <h2 className="font-bold">꼭 알아 주세요</h2>
            <p className="text-sm/relaxed text-muted">
              꼬리노트는 진단 도구가 아니에요. 진단, 처방, 약 용량은 안내하지 않아요. 응급이 의심되면 가까운 24시간
              동물병원에 바로 연락해 주세요.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
