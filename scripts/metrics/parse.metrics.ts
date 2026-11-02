import { execSync } from "node:child_process";
import { appendFileSync, existsSync, writeFileSync } from "node:fs";
import { expect, it } from "vitest";
import { toDrafts } from "@/lib/domain/chat-turn";
import { extractEntries, type EntryDraft } from "@/lib/domain/extract-entries";
import { chooseParser, type Parser } from "@/lib/domain/parse-route";
import { callChatLlm } from "@/lib/server/chat-llm";
import { serverConfig } from "@/lib/server/config";
import {
  CASE_CATEGORIES,
  DEFAULT_DOG_NAME,
  PARSE_CASES,
  PARSE_CASES_VERSION,
  PARSE_NOW_ISO,
  PARSE_TIME_ZONE,
} from "./parse-cases";
import { scoreCase } from "./score";

const RUNS = 3;
// ADR-0001, gpt-6-luna (USD / 1M 토큰)
const PRICE_PER_1M = { input: 0.1, output: 0.5 };
const CSV_PATH = "docs/metrics.csv";
const REPORT_PATH = "scripts/metrics/parse-report.md";
const MODES = ["code", "llm", "hybrid"] as const;
type Mode = (typeof MODES)[number];

interface LlmCall {
  drafts: EntryDraft[] | null;
  inputTokens: number;
  outputTokens: number;
  ms: number;
}

interface CaseResult {
  correct: Record<Mode, boolean>;
  parser: Parser;
  llm: LlmCall;
  codeMs: number;
}

const costOf = (call: LlmCall) =>
  (call.inputTokens * PRICE_PER_1M.input + call.outputTokens * PRICE_PER_1M.output) / 1_000_000;

const runLlm = async (text: string, dogName: string, credentials: { apiKey: string; model: string }) => {
  try {
    const { turn, usage, ms } = await callChatLlm(
      { text, nowIso: PARSE_NOW_ISO, timeZone: PARSE_TIME_ZONE, dogName, isFirstTurn: false },
      credentials,
    );
    const drafts = toDrafts(turn.entries, { nowIso: PARSE_NOW_ISO, timeZone: PARSE_TIME_ZONE, rawText: text });
    return { drafts, ...usage, ms };
  } catch (error) {
    console.error(`[metrics] LLM 실패: ${text}`, error instanceof Error ? error.message : error);
    return { drafts: null, inputTokens: 0, outputTokens: 0, ms: 0 };
  }
};

const runOnce = async (credentials: { apiKey: string; model: string }): Promise<CaseResult[]> => {
  const results: CaseResult[] = [];
  for (const testCase of PARSE_CASES) {
    const dogName = testCase.dogName ?? DEFAULT_DOG_NAME;
    const codeStartedAt = performance.now();
    const extracted = extractEntries(testCase.text, { nowIso: PARSE_NOW_ISO, timeZone: PARSE_TIME_ZONE, dogName });
    const codeMs = performance.now() - codeStartedAt;
    const parser = chooseParser(testCase.text, extracted);
    const llm = await runLlm(testCase.text, dogName, credentials);
    const hybridDrafts = parser === "code" ? extracted.drafts : (llm.drafts ?? extracted.drafts);
    const score = (drafts: EntryDraft[]) => scoreCase(testCase.expected, drafts, PARSE_TIME_ZONE);
    results.push({
      correct: { code: score(extracted.drafts), llm: score(llm.drafts ?? []), hybrid: score(hybridDrafts) },
      parser,
      llm,
      codeMs,
    });
  }
  return results;
};

const summarize = (runs: CaseResult[][]) => {
  const n = PARSE_CASES.length;
  const avg = (pick: (results: CaseResult[]) => number) => runs.reduce((sum, r) => sum + pick(r), 0) / runs.length;
  const llmCases = (r: CaseResult[], mode: Mode) =>
    mode === "code" ? [] : mode === "llm" ? r : r.filter((c) => c.parser === "llm");
  return Object.fromEntries(
    MODES.map((mode) => {
      const accuracy = avg((r) => r.filter((c) => c.correct[mode]).length) / n;
      const calls = avg((r) => llmCases(r, mode).length);
      const inputTokens = avg((r) => llmCases(r, mode).reduce((s, c) => s + c.llm.inputTokens, 0));
      const outputTokens = avg((r) => llmCases(r, mode).reduce((s, c) => s + c.llm.outputTokens, 0));
      const costPer1000 = (avg((r) => llmCases(r, mode).reduce((s, c) => s + costOf(c.llm), 0)) / n) * 1000;
      const avgMs = avg((r) => {
        const llmSet = new Set(llmCases(r, mode));
        return r.reduce((s, c) => s + (llmSet.has(c) ? c.llm.ms : c.codeMs), 0) / n;
      });
      return [mode, { accuracy, calls, inputTokens, outputTokens, costPer1000, avgMs }];
    }),
  ) as Record<
    Mode,
    { accuracy: number; calls: number; inputTokens: number; outputTokens: number; costPer1000: number; avgMs: number }
  >;
};

const report = (runs: CaseResult[][]) => {
  const summary = summarize(runs);
  const lines: string[] = [];
  lines.push(
    `시험지 v${PARSE_CASES_VERSION}, ${PARSE_CASES.length}문장, LLM ${RUNS}회 평균, 모델 ${serverConfig.models.parse}`,
  );
  lines.push("");
  lines.push("| 방식 | 정답률 | LLM 호출 | 입력 토큰 | 출력 토큰 | 1,000개당 비용 | 평균 시간 |");
  lines.push("|---|---|---|---|---|---|---|");
  for (const mode of MODES) {
    const s = summary[mode];
    lines.push(
      `| ${mode} | ${(s.accuracy * 100).toFixed(1)}% | ${s.calls.toFixed(1)} | ${s.inputTokens.toFixed(0)} | ${s.outputTokens.toFixed(0)} | $${s.costPer1000.toFixed(4)} | ${s.avgMs.toFixed(0)}ms |`,
    );
  }

  lines.push("");
  lines.push("| 분류 | code | llm | hybrid |");
  lines.push("|---|---|---|---|");
  for (const category of CASE_CATEGORIES) {
    const indexes = PARSE_CASES.flatMap((c, i) => (c.category === category ? [i] : []));
    const cell = (mode: Mode) =>
      (runs.reduce((sum, r) => sum + indexes.filter((i) => r[i].correct[mode]).length, 0) / runs.length).toFixed(1);
    lines.push(`| ${category} (${indexes.length}) | ${cell("code")} | ${cell("llm")} | ${cell("hybrid")} |`);
  }

  lines.push("");
  lines.push("| 문장 | 고른 방식 | code | llm (맞은 횟수) | hybrid (맞은 횟수) |");
  lines.push("|---|---|---|---|---|");
  PARSE_CASES.forEach((testCase, i) => {
    const count = (mode: Mode) => `${runs.filter((r) => r[i].correct[mode]).length}/${runs.length}`;
    const mark = (mode: Mode) => (runs.every((r) => r[i].correct[mode]) ? "O" : count(mode));
    lines.push(`| ${testCase.text} | ${runs[0][i].parser} | ${mark("code")} | ${mark("llm")} | ${mark("hybrid")} |`);
  });

  const confidentWrong = PARSE_CASES.filter((_, i) => runs[0][i].parser === "code" && !runs[0][i].correct.code);
  const codeChosen = runs[0].filter((c) => c.parser === "code").length;
  lines.push("");
  lines.push(`코드가 다 채웠다고 한 문장: ${codeChosen}개, 그중 틀린 문장: ${confidentWrong.length}개`);
  for (const c of confidentWrong) lines.push(`- ${c.text}`);
  const failures = runs.flat().filter((c) => c.llm.drafts === null).length;
  lines.push(`LLM 실패: ${failures}회`);
  return { summary, text: lines.join("\n") };
};

const appendCsv = (summary: ReturnType<typeof summarize>) => {
  const commit = execSync("git rev-parse --short HEAD").toString().trim();
  const dirty = execSync("git status --porcelain").toString().trim() !== "";
  const date = new Date().toISOString().slice(0, 10);
  if (!existsSync(CSV_PATH)) writeFileSync(CSV_PATH, "id,date,commit,testset,mode,value\n");
  const rows = MODES.flatMap((mode) => [
    [
      "M6",
      date,
      `${commit}${dirty ? "+dirty" : ""}`,
      `parse-v${PARSE_CASES_VERSION}`,
      mode,
      summary[mode].accuracy.toFixed(4),
    ],
    [
      "M7",
      date,
      `${commit}${dirty ? "+dirty" : ""}`,
      `parse-v${PARSE_CASES_VERSION}`,
      mode,
      summary[mode].costPer1000.toFixed(6),
    ],
  ]);
  appendFileSync(CSV_PATH, rows.map((row) => row.join(",")).join("\n") + "\n");
};

it("칩 만들기 방식 비교 (M6, M7)", async () => {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = serverConfig.models.parse;
  expect(apiKey, ".env.local에 OPENAI_API_KEY가 필요해요").toBeTruthy();
  expect(model, ".env.local에 OPENAI_MODEL_PARSE가 필요해요").toBeTruthy();

  const runs: CaseResult[][] = [];
  for (let i = 0; i < RUNS; i += 1) runs.push(await runOnce({ apiKey: apiKey!, model }));

  const { summary, text } = report(runs);
  writeFileSync(REPORT_PATH, `${text}\n`);
  appendCsv(summary);
});
