import { describe, expect, it } from "vitest";
import { extractEntries } from "./extract-entries";
import { chooseParser, looksLikeQuestion, mentionsNotDoneOrOthers } from "./parse-route";

const choose = (text: string) =>
  chooseParser(
    text,
    extractEntries(text, { nowIso: "2026-11-02T06:00:00.000Z", timeZone: "Asia/Seoul", dogName: "곰순이" }),
  );

describe("looksLikeQuestion", () => {
  it.each([
    "어제 응가 몇 번 했어",
    "배변 괜찮아?",
    "산책 언제 했지",
    "왜 설사하지",
    "밥을 얼마나 먹었나요",
    "요즘 응가 어때",
    "지난주 산책은 어땠어",
    "병원 가야 할까",
    "설사했니",
  ])("%s", (text) => {
    expect(looksLikeQuestion(text)).toBe(true);
  });

  it.each(["방금 응가했는데 무른 편이야", "밥 먹고 산책했어", "천둥 쳐서 5분 동안 떨었어", "간식 줬어."])(
    "%s 는 질문이 아니다",
    (text) => {
      expect(looksLikeQuestion(text)).toBe(false);
    },
  );
});

describe("mentionsNotDoneOrOthers", () => {
  it.each([
    "옆집 개가 설사했어",
    "친구네 강아지가 토했어",
    "다른 강아지가 절뚝거려",
    "응가했대",
    "오늘은 비 와서 산책 못 했어",
    "밥을 안 먹었어",
    "아직 응가 안했어",
    "간식은 주지 않았어",
    "이따 산책 갈 거야",
    "내일 병원 갈 예정이야",
  ])("%s", (text) => {
    expect(mentionsNotDoneOrOthers(text)).toBe(true);
  });

  it.each(["방금 응가했는데 무른 편이야", "밥 먹고 산책했어", "안녕! 오늘도 잘 부탁해", "트릿 하나 줬어"])(
    "%s 는 해당하지 않는다",
    (text) => {
      expect(mentionsNotDoneOrOthers(text)).toBe(false);
    },
  );
});

describe("chooseParser", () => {
  it("코드가 칩을 다 채운 기록 문장은 코드", () => {
    expect(choose("방금 응가했는데 무른 편이야")).toBe("code");
    expect(choose("밥 먹고 산책했어")).toBe("code");
  });

  it("코드가 칩을 다 채우지 못하면 LLM", () => {
    expect(choose("배변했어")).toBe("llm");
    expect(choose("발을 계속 핥아")).toBe("llm");
  });

  it("코드가 칩을 다 채웠어도 질문처럼 보이면 LLM", () => {
    expect(choose("방금 응가 무른 편이었는데 괜찮아?")).toBe("llm");
  });

  it("코드가 칩을 다 채웠어도 남의 일이나 안 한 일이면 LLM", () => {
    expect(choose("옆집 개가 설사했대")).toBe("llm");
    expect(choose("오늘은 비 와서 산책 못 했어")).toBe("llm");
  });
});
