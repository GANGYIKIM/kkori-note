import { AlertIcon, InfoIcon } from "../Icons";

/** 요청 한도 초과, 오류 같은 시스템 안내 */
export function NoticeBanner({ tone, text }: { tone: "info" | "error"; text: string }) {
  const Icon = tone === "error" ? AlertIcon : InfoIcon;
  return (
    <div className="flex items-start gap-2 rounded-xl bg-surface px-3 py-2.5 text-sm text-muted">
      <Icon width={16} height={16} className={`mt-0.5 shrink-0 ${tone === "error" ? "text-danger" : ""}`} />
      <p>{text}</p>
    </div>
  );
}
