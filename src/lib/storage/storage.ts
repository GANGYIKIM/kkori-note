import type { ConsultMessage, Dog, LogEntry, Settings } from "@/lib/domain/types";

/** 기간 조회 옵션. from/to는 ISO 8601, 양 끝 포함 */
interface ListEntriesOptions {
  from?: string;
  to?: string;
  kinds?: LogEntry["kind"][];
}

/**
 * 저장소 인터페이스. 화면 코드는 구현이 아니라 이 인터페이스에만 의존한다.
 * 현재 구현은 브라우저 IndexedDB. 추후 서버 저장/앱(SQLite 등)으로 교체할 수 있다.
 */
interface Storage {
  getDog(): Promise<Dog | null>;
  saveDog(dog: Dog): Promise<void>;

  getSettings(): Promise<Settings>;
  saveSettings(settings: Settings): Promise<void>;

  saveEntry(entry: LogEntry): Promise<void>;
  getEntry(id: string): Promise<LogEntry | null>;
  listEntries(dogId: string, options?: ListEntriesOptions): Promise<LogEntry[]>;
  deleteEntry(id: string): Promise<void>;

  saveConsultMessage(message: ConsultMessage): Promise<void>;
  listConsultMessages(dogId: string): Promise<ConsultMessage[]>;
}

export type { ListEntriesOptions, Storage };
