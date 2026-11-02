"use client";

import { useEffect, useState, type FormEvent } from "react";
import { DEFAULT_DOG_ID, getStorage } from "@/lib/client/storage";
import { DEFAULT_MODE, LABELS, MODES, type Mode } from "@/lib/domain/values";
import { DogSchema, type Dog } from "@/lib/domain/types";

type Status = "loading" | "ready" | "saved" | "error";

const toNumberOrNull = (value: string): number | null => {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

const ProfileForm = () => {
  const [status, setStatus] = useState<Status>("loading");
  const [dogId, setDogId] = useState<string>("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState<Mode>(DEFAULT_MODE);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const storage = getStorage();
      const [dog, settings] = await Promise.all([storage.getDog(), storage.getSettings()]);
      if (cancelled) return;
      setDogId(dog?.id ?? DEFAULT_DOG_ID);
      setName(dog?.name ?? "");
      setAge(dog?.ageYears?.toString() ?? "");
      setWeight(dog?.weightKg?.toString() ?? "");
      setNotes(dog?.notes ?? "");
      setMode(settings.mode);
      setStatus("ready");
    })().catch(() => {
      if (!cancelled) {
        setMessage("저장된 정보를 불러오지 못했어요. 브라우저 저장소 설정을 확인해 주세요.");
        setStatus("error");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const candidate: Dog = {
      id: dogId,
      name: name.trim(),
      ageYears: toNumberOrNull(age),
      weightKg: toNumberOrNull(weight),
      notes: notes.trim(),
    };
    const result = DogSchema.safeParse(candidate);
    if (!result.success) {
      setMessage("이름은 필수이고, 나이와 체중은 올바른 숫자로 입력해 주세요.");
      setStatus("error");
      return;
    }
    try {
      const storage = getStorage();
      await storage.saveDog(result.data);
      await storage.saveSettings({ mode });
      setMessage("저장했어요.");
      setStatus("saved");
    } catch {
      setMessage("저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
      setStatus("error");
    }
  };

  const inputClass =
    "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base outline-none focus:border-accent";

  if (status === "loading") return <p className="text-sm text-muted">불러오는 중…</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="font-bold">강아지 프로필</h2>
      <label className="block text-sm">
        이름
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={30} required />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          나이(살)
          <input className={inputClass} inputMode="decimal" value={age} onChange={(e) => setAge(e.target.value)} />
        </label>
        <label className="block text-sm">
          체중(kg)
          <input
            className={inputClass}
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </label>
      </div>
      <label className="block text-sm">
        특이사항
        <textarea
          className={inputClass}
          rows={3}
          maxLength={500}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm">상담 태도</legend>
        <div className="flex gap-2">
          {MODES.map((m) => (
            <label
              key={m}
              className={`flex-1 cursor-pointer rounded-xl border px-3 py-2 text-center text-sm ${
                mode === m ? "border-accent bg-accent font-bold text-accent-foreground" : "border-border bg-background"
              }`}
            >
              <input
                type="radio"
                name="mode"
                value={m}
                checked={mode === m}
                onChange={() => setMode(m)}
                className="sr-only"
              />
              {LABELS.mode[m]}
            </label>
          ))}
        </div>
      </fieldset>

      <button type="submit" className="w-full rounded-xl bg-accent py-3 font-bold text-accent-foreground">
        저장
      </button>
      {message ? (
        <p role="status" className={`text-sm ${status === "error" ? "text-danger" : "text-muted"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
};

export { ProfileForm };
