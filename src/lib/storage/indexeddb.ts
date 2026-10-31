import Dexie, { type EntityTable } from "dexie";
import { SettingsSchema, type ConsultMessage, type Dog, type LogEntry, type Settings } from "@/lib/domain/types";
import type { ListEntriesOptions, Storage } from "./storage";

interface SettingsRow extends Settings {
  key: "settings";
}

class KkoriDB extends Dexie {
  dogs!: EntityTable<Dog, "id">;
  entries!: EntityTable<LogEntry, "id">;
  messages!: EntityTable<ConsultMessage, "id">;
  settings!: EntityTable<SettingsRow, "key">;

  constructor() {
    super("kkori-note");
    this.version(1).stores({
      dogs: "id",
      // [dogId+occurredAt]: 강아지별 기간 조회에 쓴다
      entries: "id, dogId, kind, occurredAt, [dogId+occurredAt]",
      messages: "id, dogId, createdAt",
      settings: "key",
    });
  }
}

/** 브라우저 전용 구현. 서버(Route Handler, 서버 컴포넌트)에서 호출하면 안 된다. */
const createIndexedDbStorage = (): Storage => {
  const db = new KkoriDB();

  return {
    async getDog() {
      const dogs = await db.dogs.toArray();
      return dogs[0] ?? null; // 한 마리 고정
    },
    async saveDog(dog) {
      await db.dogs.put(dog);
    },

    async getSettings() {
      const row = await db.settings.get("settings");
      return SettingsSchema.parse(row ?? {});
    },
    async saveSettings(settings) {
      await db.settings.put({ key: "settings", ...settings });
    },

    async saveEntry(entry) {
      await db.entries.put(entry);
    },
    async getEntry(id) {
      return (await db.entries.get(id)) ?? null;
    },
    async listEntries(dogId, options: ListEntriesOptions = {}) {
      const rows = await db.entries.where("dogId").equals(dogId).toArray();
      return rows
        .filter((e) => (options.from ? e.occurredAt >= options.from : true))
        .filter((e) => (options.to ? e.occurredAt <= options.to : true))
        .filter((e) => (options.kinds ? options.kinds.includes(e.kind) : true))
        .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
    },
    async deleteEntry(id) {
      await db.entries.delete(id);
    },

    async saveConsultMessage(message) {
      await db.messages.put(message);
    },
    async listConsultMessages(dogId) {
      const rows = await db.messages.where("dogId").equals(dogId).toArray();
      return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
  };
};

export { createIndexedDbStorage };
