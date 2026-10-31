"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { LogEntrySchema, type LogEntry } from "@/lib/domain/types";
import { ENTRY_KINDS, KIND_STYLES, LABELS, MODES, type Mode, type RiskGrade } from "@/lib/domain/values";
import { CHAT_CASES, MOCK_ENTRIES, MOCK_NOW, MOCK_TIME_ZONE, toEntryMap } from "@/lib/mock/data";
import { AlertIcon, BackIcon, InfoIcon } from "@/components/common/Icons";
import { MessageComposer, ComposerLauncher } from "@/components/chat/MessageComposer";
import { Conversation } from "@/components/chat/Conversation";
import { EntryChipCard } from "@/components/chat/EntryChipCard";
import { EpisodeCard } from "@/components/chat/EpisodeCard";
import { EvidenceCard } from "@/components/chat/EvidenceCard";
import { Banner } from "@/components/common/Banner";
import { RiskBanner } from "@/components/chat/RiskBanner";
import { EmptyState } from "@/components/common/EmptyState";
import { EditForm } from "@/components/entry/EditSheet";
import { DateGroupedList } from "@/components/entry/DateGroupedList";
import { Tag } from "@/components/common/Tag";
import { OngoingEpisodeBar } from "@/components/entry/OngoingEpisodeBar";

const map = toEntryMap(MOCK_ENTRIES);
const tz = MOCK_TIME_ZONE;

const SWATCHES = [
  ["background", "bg-background"],
  ["surface", "bg-surface"],
  ["surface-strong", "bg-surface-strong"],
  ["border", "bg-border"],
  ["muted", "bg-muted"],
  ["foreground", "bg-foreground"],
  ["accent", "bg-accent"],
  ["danger", "bg-danger"],
  ["warning", "bg-warning"],
  ["success", "bg-success"],
] as const;

/** PRD R6의 등급 × 모드 문장 예시 (초콜릿). 실제 문장 표는 안전 판단 단계에서 코드로 옮긴다 */
const RISK_COPY: Record<RiskGrade, Record<Mode, { title: string; body: string }>> = {
  high: Object.fromEntries(
    MODES.map((m) => [
      m,
      {
        title: "지금 가까운 동물병원에 연락해 주세요",
        body: "시간이 중요해요. 야간이면 24시간 동물병원에 연락해 주세요. (모든 모드 동일)",
      },
    ]),
  ) as Record<Mode, { title: string; body: string }>,
  caution: {
    overprotective: {
      title: "빨리 병원에 전화해 상담받아 보세요",
      body: "먹은 양과 지금 상태를 말씀하시면 병원에서 바로 와야 할지 알려줄 거예요.",
    },
    neutral: { title: "병원에 전화로 상담받아 보시길 권해요", body: "몸무게에 비해 주의가 필요한 양이에요." },
    easygoing: {
      title: "다니시는 병원에 전화로 한번 물어보세요",
      body: "주의가 필요한 양이라 확인해 두면 안심이 돼요.",
    },
  },
  low: {
    overprotective: {
      title: "지금은 위험 수치 아래예요",
      body: "그래도 6~12시간 동안 구토·설사·흥분이 있는지 지켜봐 주시고, 걱정되면 병원에 연락해 주세요.",
    },
    neutral: { title: "위험 수치 아래예요", body: "6~12시간 동안 구토·설사·흥분을 지켜봐 주세요." },
    easygoing: {
      title: "이 양이면 크게 위험하지 않을 수 있어요",
      body: "6~12시간 정도 지켜보시고, 다니시는 병원에 문의해 보시면 더 좋아요.",
    },
  },
};

const SECTIONS = [
  ["tokens", "색과 태그"],
  ["rows", "기록 목록"],
  ["ongoing", "진행 중 띠"],
  ["empty", "빈 상태"],
  ["input", "입력창"],
  ["chips", "칩 카드"],
  ["cards", "근거·에피소드 카드"],
  ["risk", "위험 안내"],
  ["notice", "시스템 안내"],
  ["edit", "칩 수정 폼"],
  ["cases", "채팅 케이스"],
] as const;

const ComponentCatalog = () => {
  const [draft, setDraft] = useState<LogEntry>(map["e-choco"]);

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-20">
      <header className="sticky top-0 z-10 -mx-4 flex h-14 items-center gap-1 bg-background/95 px-4 backdrop-blur-sm">
        <Link href="/" aria-label="메인으로" className="-ml-2 rounded-lg p-2 text-muted hover:bg-surface">
          <BackIcon />
        </Link>
        <h1 className="text-lg font-bold">컴포넌트 미리보기</h1>
      </header>

      <p className="text-sm text-muted">
        가짜 데이터로 그린 화면 조각과 PRD 예시 케이스예요. 기준 시각은 2026년 10월 29일 12:00 (서울)이에요.
      </p>
      <nav className="mt-3 flex flex-wrap gap-1.5" aria-label="목차">
        {SECTIONS.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="rounded-full bg-surface px-3 py-1 text-sm">
            {label}
          </a>
        ))}
      </nav>

      <Section id="tokens" title="색과 태그" note="globals.css의 토큰. 기록 종류마다 진한 글자 + 10% 배경">
        <div className="grid grid-cols-5 gap-2">
          {SWATCHES.map(([name, cls]) => (
            <div key={name} className="space-y-1 text-center">
              <div className={`h-10 rounded-lg border border-border ${cls}`} />
              <p className="text-[11px] text-muted">{name}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ENTRY_KINDS.map((kind) => (
            <Tag key={kind} className={KIND_STYLES[kind].tag}>
              {LABELS.entryKind[kind]}
            </Tag>
          ))}
        </div>
      </Section>

      <Section id="rows" title="기록 목록" note="R0, R2 · 현지 날짜별 묶음, 추정 시각, 상태 미입력, 샘플 표시">
        <Frame>
          <DateGroupedList
            entries={[map["e-poop-soft"], map["e-meal"], map["e-poop-unknown"], { ...map["e-28-walk"], isDemo: true }]}
            nowIso={MOCK_NOW}
            timeZone={tz}
            onSelect={() => {}}
          />
        </Frame>
        <Frame>
          <DateGroupedList entries={MOCK_ENTRIES.slice(8, 15)} nowIso={MOCK_NOW} timeZone={tz} onSelect={() => {}} />
        </Frame>
      </Section>

      <Section id="ongoing" title="진행 중 띠" note="R1 · 열린 에피소드, [끝]으로 닫기">
        <OngoingEpisodeBar
          episodes={[
            map["e-thunder"],
            {
              ...map["e-27-limp"],
              id: "limp-open",
              endedAt: null,
              durationSec: null,
              occurredAt: "2026-10-29T02:20:00.000Z",
            },
          ]}
          nowIso={MOCK_NOW}
        />
      </Section>

      <Section id="empty" title="빈 상태" note="R0, R10 · 첫 기록 예시와 샘플 불러오기">
        <EmptyState
          title="아직 기록이 없어요"
          description={'아래 입력창에 이렇게 적어 보세요. "방금 배변했는데 무른 편이야"'}
          action={
            <span className="inline-block h-10 rounded-xl bg-accent/10 px-4 text-sm/10 font-bold text-accent">
              샘플 기록 불러오기
            </span>
          }
        />
      </Section>

      <Section id="input" title="입력창" note="R0 · 메인의 열기 버튼, 채팅 안의 입력창">
        <ComposerLauncher onOpen={() => {}} />
        <MessageComposer onSend={() => {}} />
      </Section>

      <Section id="chips" title="칩 카드" note="R1 · 즉시 저장, ? 칸과 후보, 여러 장, 되돌림">
        <EntryChipCard entries={[map["e-poop-soft"]]} timeZone={tz} />
        <EntryChipCard
          entries={[map["e-poop-unknown"]]}
          uncertain={[{ entryId: "e-poop-unknown", field: "stoolState", candidates: ["normal", "soft", "diarrhea"] }]}
          timeZone={tz}
        />
        <EntryChipCard entries={[map["e-meal"], map["e-walk"]]} timeZone={tz} />
        <EntryChipCard entries={[map["e-28-walk"]]} undone timeZone={tz} />
      </Section>

      <Section id="cards" title="근거·에피소드 카드" note="R4 · 범위·건수·목록은 코드가 만든다">
        <EvidenceCard
          rangeLabel="최근 7일 · 10월 23일 ~ 29일"
          summary="배변 8건 · 딱딱함 1, 정상 3, 무름 3, 설사 1"
          entries={MOCK_ENTRIES.filter((e) => e.kind === "poop" && e.occurredAt >= "2026-10-22T15:00:00.000Z")}
          canExpand
          timeZone={tz}
        />
        <EvidenceCard rangeLabel="최근 3일 · 절뚝임" summary="절뚝임 0건" entries={[]} canExpand timeZone={tz} />
        <EpisodeCard
          episodes={[map["e-seizure-today"], map["e-25-seizure"], map["e-thunder"]]}
          nowIso={MOCK_NOW}
          timeZone={tz}
        />
      </Section>

      <Section id="risk" title="위험 안내" note="R6 · 등급은 코드가 정하고 모드는 말투만 바꾼다. 🔴는 모든 모드 동일">
        {(["high", "caution", "low"] as const).map((grade) => (
          <div key={grade} className="space-y-2">
            <p className="text-sm font-bold">{LABELS.riskGrade[grade]}</p>
            {(grade === "high" ? (["neutral"] as const) : MODES).map((mode) => (
              <div key={mode} className="space-y-1">
                {grade !== "high" ? <p className="text-xs text-muted">{LABELS.mode[mode]} 모드</p> : null}
                <RiskBanner grade={grade} title={RISK_COPY[grade][mode].title} body={RISK_COPY[grade][mode].body} />
              </div>
            ))}
          </div>
        ))}
      </Section>

      <Section id="notice" title="시스템 안내" note="R9 · 요청 한도, 오류">
        <Banner tone="danger" icon={<AlertIcon width={16} height={16} />}>
          오늘 사용할 수 있는 AI 상담 횟수를 모두 사용했어요. 기록은 계속 남길 수 있어요.
        </Banner>
        <Banner icon={<InfoIcon width={16} height={16} />}>
          지금은 화면 미리보기라 입력한 문장을 처리하지 않아요.
        </Banner>
      </Section>

      <Section id="edit" title="칩 수정 폼" note="R0, R1 · 기록을 탭하면 열리는 시트의 내용. 종류에 따라 칸이 바뀐다">
        <Frame>
          <div className="p-3">
            <EditForm entry={draft} timeZone={tz} onChange={setDraft} />
          </div>
        </Frame>
        <div className="flex flex-wrap gap-1.5">
          {["e-choco", "e-poop-unknown", "e-27-limp", "e-28-walk"].map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setDraft(LogEntrySchema.parse(map[id]))}
              className="rounded-full bg-surface px-3 py-1 text-sm"
            >
              {LABELS.entryKind[map[id].kind]} 예시
            </button>
          ))}
        </div>
      </Section>

      <Section id="cases" title="채팅 케이스" note="PRD의 예시 대화. 메인 화면의 채팅에도 이어 붙여 두었어요">
        {CHAT_CASES.map((c) => (
          <article key={c.id} className="space-y-3">
            <div>
              <h3 className="font-bold">{c.title}</h3>
              <p className="text-xs text-muted">{c.prd}</p>
            </div>
            <Frame>
              <div className="p-3">
                <Conversation messages={c.messages} entries={c.entries} nowIso={MOCK_NOW} timeZone={tz} />
              </div>
            </Frame>
          </article>
        ))}
      </Section>
    </div>
  );
};

const Section = ({ id, title, note, children }: { id: string; title: string; note: string; children: ReactNode }) => {
  return (
    <section
      id={id}
      className="scroll-mt-16 space-y-3 border-t border-border pt-6 not-first-of-type:mt-8 first-of-type:mt-6"
    >
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-sm text-muted">{note}</p>
      </div>
      {children}
    </section>
  );
};

const Frame = ({ children }: { children: ReactNode }) => {
  return <div className="rounded-2xl border border-border">{children}</div>;
};

export { ComponentCatalog };
