import "client-only";
import { createIndexedDbStorage } from "@/lib/storage/indexeddb";
import type { Storage } from "@/lib/storage/storage";

/** 한 마리 고정이라 이름을 정하기 전에도 기록과 대화를 이 id로 저장한다 */
const DEFAULT_DOG_ID = "dog";

let instance: Storage | null = null;

/** 브라우저에서만 호출한다 (useEffect/이벤트 핸들러 안). 화면은 이 함수가 돌려주는 Storage 인터페이스에만 의존한다. */
const getStorage = (): Storage => {
  if (!instance) instance = createIndexedDbStorage();
  return instance;
};

export { DEFAULT_DOG_ID, getStorage };
