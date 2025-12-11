import React from "react";

type CardProps = Readonly<{
  title?: string;
  footer?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}>;

export default function Card({ title, footer, className, children }: CardProps) {
  return (
    <section
      className={`rounded-xl border border-[var(--border)] bg-[var(--background)] shadow-sm ${
        className ?? ""
      }`}
    >
      {(title || footer) && (
        <header className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          {title && <h2 className="text-base font-semibold">{title}</h2>}
          {footer}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}
