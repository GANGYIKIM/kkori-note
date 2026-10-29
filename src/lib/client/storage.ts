import { createIndexedDbStorage } from "@/lib/storage/indexeddb";
import type { Storage } from "@/lib/storage/storage";

let instance: Storage | null = null;

/** 브라우저에서만 호출한다 (useEffect/이벤트 핸들러 안). 화면은 이 함수가 돌려주는 Storage 인터페이스에만 의존한다. */
export function getStorage(): Storage {
  if (!instance) instance = createIndexedDbStorage();
  return instance;
}
