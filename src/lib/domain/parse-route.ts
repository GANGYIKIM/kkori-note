import type { ExtractResult } from "./extract-entries";

type Parser = "code" | "llm";

const QUESTION_ENDING = /(까|니|나요|가요|죠|냐|어때)[.!~\s]*$/;
const QUESTION_WORD = /몇|언제|왜|어떻게|얼마나|어땠/;

const OTHER_DOG = /옆집|남의|다른 ?(개|강아지)|친구네|친구 ?(개|강아지)/;
const HEARSAY_ENDING = /(대|래)[.!~\s]*$/;
const NOT_DONE = /(못|안) ?(했|먹|쌌|갔|나갔)|않았/;
const PLAN = /거야|거예요|할게|갈게|려고|예정/;

const looksLikeQuestion = (text: string): boolean =>
  text.includes("?") || QUESTION_ENDING.test(text) || QUESTION_WORD.test(text);

/** 다른 개의 일, 전해 들은 일, 하지 않은 일, 앞으로 할 일. 사전은 이것을 구분하지 못한다 */
const mentionsNotDoneOrOthers = (text: string): boolean =>
  OTHER_DOG.test(text) || HEARSAY_ENDING.test(text) || NOT_DONE.test(text) || PLAN.test(text);

/** 코드가 칩을 다 채웠고 질문이나 남의 일·안 한 일처럼 보이지 않으면 코드 결과를 쓴다 (설계 원칙 4) */
const chooseParser = (text: string, extracted: ExtractResult): Parser =>
  extracted.needsLlm || looksLikeQuestion(text) || mentionsNotDoneOrOthers(text) ? "llm" : "code";

export { chooseParser, looksLikeQuestion, mentionsNotDoneOrOthers };
export type { Parser };
