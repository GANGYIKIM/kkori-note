"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { DEFAULT_DOG_ID, getStorage } from "@/lib/client/storage";
import { AGE_RULE, DogSchema, WEIGHT_RULE, type Dog } from "@/lib/domain/types";
import { commitNumberText, rangeHint, sanitizeNumberText, type NumberRule } from "@/lib/domain/number-input";
import { UnitInput } from "@/components/common/UnitInput";

type Status = "loading" | "ready" | "saved" | "error";

/** 칠 때는 규칙대로 거르고, 칸을 벗어날 때 최소값을 맞춘 값으로 되돌려 넣는다 */
const numberInputProps = (rule: NumberRule, text: string, setText: (text: string) => void) => ({
  value: text,
  inputMode: rule.integer ? ("numeric" as const) : ("decimal" as const),
  placeholder: rangeHint(rule),
  onChange: (e: ChangeEvent<HTMLInputElement>) => {
    const next = sanitizeNumberText(e.target.value, rule);
    if (next !== null) setText(next);
  },
  onBlur: () => {
    const value = commitNumberText(text, rule);
    setText(value === null ? "" : String(value));
  },
});

const ProfileForm = () => {
  const [status, setStatus] = useState<Status>("loading");
  const [dogId, setDogId] = useState<string>("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const storage = getStorage();
      const dog = await storage.getDog();
      if (cancelled) return;
      setDogId(dog?.id ?? DEFAULT_DOG_ID);
      setName(dog?.name ?? "");
      setAge(dog?.ageYears?.toString() ?? "");
      setWeight(dog?.weightKg?.toString() ?? "");
      setNotes(dog?.notes ?? "");
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
      ageYears: commitNumberText(age, AGE_RULE),
      weightKg: commitNumberText(weight, WEIGHT_RULE),
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
          나이
          <UnitInput unit="살" className="mt-1" {...numberInputProps(AGE_RULE, age, setAge)} />
        </label>
        <label className="block text-sm">
          체중
          <UnitInput unit="kg" className="mt-1" {...numberInputProps(WEIGHT_RULE, weight, setWeight)} />
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
