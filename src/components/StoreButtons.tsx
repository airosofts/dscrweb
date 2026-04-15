export function StoreButtons() {
  return (
    <div className="mb-3.5 flex flex-wrap gap-3 max-[480px]:flex-col max-[480px]:items-center max-[900px]:justify-center">
      <a
        href="https://apps.apple.com/app/dscr-calculator-pro/id0000000000"
        className="inline-flex items-center gap-2.5 rounded-[10px] bg-cream px-6 py-3 text-ink transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)] max-[480px]:w-full max-[480px]:max-w-[240px] max-[480px]:justify-center"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-[22px] w-[22px] shrink-0">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
        <span className="flex flex-col items-start leading-none">
          <span className="text-[9px] font-medium tracking-[0.03em] text-slate">Download on the</span>
          <span className="mt-0.5 text-base font-bold tracking-[-0.01em]">App Store</span>
        </span>
      </a>
    </div>
  );
}
