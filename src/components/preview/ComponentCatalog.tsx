"use client";

import { AlertIcon } from "@/components/common/Icons";
import { Banner } from "@/components/common/Banner";
import { CATALOG, FOLDER_ORDER } from "./catalog";
import { PreviewHeader } from "./PreviewHeader";
import type { Variant } from "./variant";

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

const pathsIn = (folder: string) => Object.keys(CATALOG).filter((p) => p.startsWith(`${folder}/`));

/** 컴포넌트 탭. 폴더별로 컴포넌트마다 경로, 상단 주석, 변형을 보여준다 (ADR-0010) */
const ComponentCatalog = ({ docs }: { docs: Record<string, string | null> }) => {
  const missing = Object.keys(docs).filter((p) => !(p in CATALOG));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-20">
      <PreviewHeader active="components" />

      <nav aria-label="폴더" className="mt-4 flex flex-wrap gap-1.5 lg:hidden">
        {["tokens", ...FOLDER_ORDER].map((id) => (
          <a key={id} href={`#${id}`} className="rounded-full bg-surface px-3 py-1 text-sm">
            {id}
          </a>
        ))}
      </nav>

      {missing.length > 0 ? (
        <div className="mt-4">
          <Banner tone="danger" icon={<AlertIcon />} title="미리보기가 없는 컴포넌트가 있어요">
            {missing.join(", ")} 옆에 X.preview.tsx를 만들고 preview/catalog.ts에 등록해 주세요.
          </Banner>
        </div>
      ) : null}

      <div className="lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
        <nav aria-label="컴포넌트 목록" className="hidden space-y-4 pt-6 lg:sticky lg:top-24 lg:block lg:self-start">
          <a href="#tokens" className="block text-sm font-bold">
            tokens
          </a>
          {FOLDER_ORDER.map((folder) => (
            <div key={folder} className="space-y-1">
              <a href={`#${folder}`} className="block text-sm font-bold">
                {folder}/
              </a>
              {pathsIn(folder).map((p) => (
                <a key={p} href={`#${p}`} className="block pl-3 text-sm text-muted hover:text-foreground">
                  {p.slice(folder.length + 1)}
                </a>
              ))}
            </div>
          ))}
        </nav>

        <div>
          <section id="tokens" className="scroll-mt-24 space-y-3 pt-6">
            <h2 className="text-xl font-bold">tokens</h2>
            <p className="text-sm text-muted">globals.css의 색 토큰이에요. 기록 종류별 색은 common/Tag에 있어요.</p>
            <div className="grid max-w-md grid-cols-5 gap-2">
              {SWATCHES.map(([name, cls]) => (
                <div key={name} className="space-y-1 text-center">
                  <div className={`h-10 rounded-lg border border-border ${cls}`} />
                  <p className="text-[11px] text-muted">{name}</p>
                </div>
              ))}
            </div>
          </section>

          {FOLDER_ORDER.map((folder) => (
            <section key={folder} id={folder} className="scroll-mt-24 pt-12">
              <h2 className="text-xl font-bold">{folder}/</h2>
              {pathsIn(folder).map((p) => (
                <ComponentEntry key={p} path={p} doc={docs[p] ?? null} variants={CATALOG[p]} />
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

const ComponentEntry = ({
  path,
  doc,
  variants,
}: {
  path: string;
  doc: string | null;
  variants: readonly Variant[];
}) => {
  return (
    <article id={path} className="mt-6 scroll-mt-24 space-y-4 border-t border-border pt-6">
      <div className="space-y-2">
        <h3 className="font-mono text-base font-bold">{path}</h3>
        <p className="text-sm/relaxed whitespace-pre-wrap text-muted">{doc ?? "상단 주석이 없어요."}</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {variants.map((variant) => (
          <figure key={variant.name} className="max-w-md min-w-0 space-y-1.5">
            <figcaption>
              <p className="text-xs font-bold">{variant.name}</p>
              {variant.note ? <p className="text-xs text-muted">{variant.note}</p> : null}
            </figcaption>
            <div className="rounded-2xl border border-dashed border-border p-3">{variant.render()}</div>
          </figure>
        ))}
      </div>
    </article>
  );
};

export { ComponentCatalog };
