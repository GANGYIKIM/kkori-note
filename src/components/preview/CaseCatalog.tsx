"use client";

import type { ChatBlock, ChatMessage } from "@/lib/domain/types";
import { LABELS, MODES, type RiskGrade } from "@/lib/domain/values";
import { CHAT_CASES, MOCK_NOW, MOCK_TIME_ZONE, RISK_COPY_EXAMPLES } from "@/lib/mock/data";
import { Conversation } from "@/components/chat/Conversation";
import { RiskBanner } from "@/components/chat/RiskBanner";
import { PreviewHeader } from "./PreviewHeader";

/** 응답 블록을 그리는 컴포넌트. chat/Conversation의 분기와 맞춘다 */
const BLOCK_COMPONENTS: Record<ChatBlock["type"], string | null> = {
  text: null,
  entries: "chat/EntryChipCard",
  evidence: "chat/EvidenceCard",
  episodes: "chat/EpisodeCard",
  risk: "chat/RiskBanner",
  notice: "common/Banner",
};

const GRADES: RiskGrade[] = ["high", "caution", "low"];

const usedComponents = (messages: readonly ChatMessage[]): string[] => {
  const used = messages.flatMap((m) => m.blocks.map((b) => BLOCK_COMPONENTS[b.type]));
  return ["chat/Conversation", ...new Set(used.filter((p): p is string => p !== null))];
};

/** PRD 장면 탭. PRD 예시 대화와 위험 등급 × 모드 문장을 실제 컴포넌트로 그린다 (ADR-0010) */
const CaseCatalog = () => {
  return (
    <div className="mx-auto w-full max-w-md px-4 pb-20">
      <PreviewHeader active="cases" />

      <p className="mt-4 text-sm text-muted">
        PRD의 예시 장면이에요. 데이터는 src/lib/mock/data.ts에 있고, 기준 시각은 2026년 10월 29일 12:00 (서울)이에요.
      </p>
      <nav aria-label="장면 목록" className="mt-3 flex flex-wrap gap-1.5">
        {CHAT_CASES.map((c) => (
          <a key={c.id} href={`#${c.id}`} className="rounded-full bg-surface px-3 py-1 text-sm">
            {c.title}
          </a>
        ))}
        <a href="#risk-copy" className="rounded-full bg-surface px-3 py-1 text-sm">
          위험 안내 문장
        </a>
      </nav>

      {CHAT_CASES.map((c) => (
        <article key={c.id} id={c.id} className="mt-8 scroll-mt-24 space-y-3 border-t border-border pt-6">
          <div>
            <h2 className="text-lg font-bold">{c.title}</h2>
            <p className="text-sm text-muted">{c.prd}</p>
          </div>
          <ComponentLinks paths={usedComponents(c.messages)} />
          <div className="rounded-2xl border border-border p-3">
            <Conversation messages={c.messages} entries={c.entries} nowIso={MOCK_NOW} timeZone={MOCK_TIME_ZONE} />
          </div>
        </article>
      ))}

      <section id="risk-copy" className="mt-8 scroll-mt-24 space-y-4 border-t border-border pt-6">
        <div>
          <h2 className="text-lg font-bold">위험 안내 문장</h2>
          <p className="text-sm text-muted">
            R6 · 등급은 코드가 정하고 모드는 말투만 바꿔요. 🔴는 모든 모드에서 같아요.
          </p>
        </div>
        <ComponentLinks paths={["chat/RiskBanner"]} />
        {GRADES.map((grade) => (
          <div key={grade} className="space-y-2">
            <p className="text-sm font-bold">{LABELS.riskGrade[grade]}</p>
            {(grade === "high" ? (["neutral"] as const) : MODES).map((mode) => (
              <div key={mode} className="space-y-1">
                {grade !== "high" ? <p className="text-xs text-muted">{LABELS.mode[mode]} 모드</p> : null}
                <RiskBanner grade={grade} {...RISK_COPY_EXAMPLES[grade][mode]} />
              </div>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
};

const ComponentLinks = ({ paths }: { paths: readonly string[] }) => {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="쓰인 컴포넌트">
      {paths.map((p) => (
        <li key={p}>
          <a href={`/preview#${p}`} className="rounded-md bg-accent/10 px-2 py-0.5 font-mono text-xs text-accent">
            {p}
          </a>
        </li>
      ))}
    </ul>
  );
};

export { CaseCatalog };
