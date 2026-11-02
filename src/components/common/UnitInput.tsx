import type { InputHTMLAttributes } from "react";

/**
 * 오른쪽 안에 단위를 흐리게 붙인 입력칸. 입력값을 거르는 일은 하지 않는다.
 * 쓸 때: 나이·체중·횟수처럼 단위가 있는 숫자칸.
 * 쓰지 않을 때: 단위 없는 글자 입력 → input. 채팅 입력 → MessageComposer.
 * @example <UnitInput unit="kg" inputMode="decimal" value={text} onChange={…} onBlur={…} />
 */
const UnitInput = ({
  unit,
  className = "",
  ...props
}: { unit: string } & Omit<InputHTMLAttributes<HTMLInputElement>, "type">) => {
  return (
    <div className={`relative ${className}`}>
      <input
        {...props}
        type="text"
        autoComplete="off"
        className="h-11 w-full rounded-lg border border-border bg-background pr-12 pl-3 text-base outline-none focus:border-accent"
      />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted">
        {unit}
      </span>
    </div>
  );
};

export { UnitInput };
