"use client";

import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}: InputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-foreground/90"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute inset-y-0 left-3 flex items-center text-foreground/60">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          {...props}
          className={`w-full h-12 ${leftIcon ? "pl-10" : "pl-6"} ${
            rightIcon ? "pr-10" : "pr-6"
          } rounded-[4px] border bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--gray-1)] border-[var(--gray-1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
            error ? "border-[var(--danger)]" : ""
          } ${className ?? ""}`}
        />
        {rightIcon && (
          <span className="absolute inset-y-0 right-3 flex items-center text-foreground/60">
            {rightIcon}
          </span>
        )}
      </div>
      {hint && !error && (
        <p className="text-xs text-foreground/60">{hint}</p>
      )}
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}

export default Input;