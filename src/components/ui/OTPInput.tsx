"use client";

import React from "react";

type Props = Readonly<{
  length?: number;
  onChange?: (code: string) => void;
}>;

export default function OTPInput({ length = 6, onChange }: Props) {
  const refs = React.useRef<HTMLInputElement[]>([]);
  const ids = React.useMemo(() => Array.from({ length }, () => crypto.randomUUID()), [length]);
  const [values, setValues] = React.useState<string[]>(new Array(length).fill(""));

  function setVal(i: number, v: string) {
    const digits = v.replaceAll(/\D/g, "");
    if (!digits) {
      const next = [...values];
      next[i] = "";
      setValues(next);
      onChange?.(next.join(""));
      return;
    }
    const next = [...values];
    if (digits.length === 1) {
      next[i] = digits[0];
      setValues(next);
      onChange?.(next.join(""));
      refs.current[i + 1]?.focus();
    } else {
      for (let k = 0; k < digits.length && i + k < length; k++) {
        next[i + k] = digits[k];
      }
      setValues(next);
      onChange?.(next.join(""));
      const last = Math.min(i + digits.length, length - 1);
      refs.current[last]?.focus();
    }
  }

  return (
    <div className="flex gap-2">
      {values.map((v, i) => (
        <input
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
          inputMode="numeric"
          pattern="[0-9]*"
          value={v}
          onChange={(e) => {
            setVal(i, e.target.value);
            if (e.target.value) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !values[i]) refs.current[i - 1]?.focus();
          }}
          onPaste={(e) => {
            const pasted = (e.clipboardData.getData("text") || "").replaceAll(/\D/g, "");
            if (!pasted) return;
            e.preventDefault();
            setVal(i, pasted);
          }}
          className="w-14 h-12 text-center text-lg rounded-[4px] border border-[var(--gray-1)] bg-white text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          key={ids[i]}
        />
      ))}
    </div>
  );
}
