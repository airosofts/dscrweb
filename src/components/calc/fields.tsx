"use client";

import { useEffect, useState } from "react";

export function Field({
  id,
  label,
  hint,
  wide,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={wide ? "col-span-full" : ""}>
      <label htmlFor={id} className="mb-1 block text-[12px] font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint && <div className="mt-1 text-[11px] leading-[1.4] text-slate">{hint}</div>}
    </div>
  );
}

/**
 * Number input that keeps its own text while typing (so "7." or an empty box
 * don't snap back), and reports a parsed number upward.
 */
export function NumberField({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  hint,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  hint?: string;
}) {
  const [text, setText] = useState(String(value));
  useEffect(() => {
    // Sync when the value changes from outside (shared link, reset).
    if (Number(text.replace(/,/g, "")) !== value) setText(String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Field id={id} label={label} hint={hint}>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-slate">{prefix}</span>
        )}
        <input
          id={id}
          name={id}
          type="number"
          inputMode="decimal"
          step={step}
          min={0}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            const v = Number(e.target.value);
            onChange(Number.isFinite(v) ? v : 0);
          }}
          className={`input tabular-nums ${prefix ? "!pl-7" : ""} ${suffix ? "!pr-8" : ""}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[14px] text-slate">{suffix}</span>
        )}
      </div>
    </Field>
  );
}

export function Segmented<T extends string>({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div id={id} role="radiogroup" className="grid auto-cols-fr grid-flow-col border border-rule bg-card-alt p-1">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`px-2 py-2 text-[12px] font-semibold leading-tight transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass ${
              on ? "bg-ink text-cream" : "text-slate hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
