import { GREETING_LINES } from "@/lib/domain/greeting";

/** 대화가 비었을 때 보이는 인사 두 말풍선. 화면에만 보이고 대화로 저장하지 않는다 (PRD R0-6, R1-3) */
const Greeting = () => {
  return (
    <div className="space-y-2">
      {GREETING_LINES.map((line) => (
        <p key={line} className="w-fit rounded-2xl rounded-bl-md bg-surface px-4 py-2.5 text-[15px] leading-relaxed">
          {line}
        </p>
      ))}
    </div>
  );
};

export { Greeting };
