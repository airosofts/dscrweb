"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { LogoMark } from "./LogoMark";

const LINKS = [
  { href: "/advertise", label: "Advertise" },
  { href: "/privacy", label: "Privacy" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Main nav bar */}
      <nav
        className={
          "fixed left-1/2 top-4 z-50 w-[calc(100%-24px)] max-w-[980px] -translate-x-1/2 border transition-all duration-300 " +
          (scrolled
            ? "border-brass/20 bg-ink/80 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            : "border-brass/10 bg-ink/40 backdrop-blur-md")
        }
      >
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-cream p-[3px] shadow-[0_2px_10px_rgba(0,0,0,0.25)] ring-1 ring-brass/20 transition-transform group-hover:scale-105">
              <LogoMark className="h-full w-full" />
            </span>
            <div className="leading-tight">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-cream max-[380px]:text-[10px]">
                DSCR Calculator Pro
              </div>
              <div className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-brass sm:block">
                Debt Service Coverage Ratio
              </div>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3.5 py-1.5 text-[12px] font-semibold tracking-[0.02em] text-cream/60 transition-all hover:bg-brass/10 hover:text-cream"
              >
                {l.label}
              </Link>
            ))}
            <a
              href="#download"
              className="ml-2 bg-cream px-4 py-2 text-[12px] font-bold tracking-[-0.01em] text-ink transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_6px_16px_rgba(250,248,244,0.2)]"
            >
              Get App →
            </a>
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center border border-brass/15 text-cream transition-colors hover:border-brass/40 hover:bg-brass/5 md:hidden"
          >
            <span className="flex h-3.5 w-4 flex-col justify-between">
              <span className="block h-[1.5px] w-full bg-cream" />
              <span className="block h-[1.5px] w-full bg-cream" />
              <span className="block h-[1.5px] w-full bg-cream" />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile menu — full screen overlay, sits ABOVE the nav */}
      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-ink md:hidden">
          {/* Top bar with logo + close */}
          <div className="flex items-center justify-between border-b border-brass/15 px-6 py-5">
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-cream p-[3px]">
                <LogoMark className="h-full w-full" />
              </span>
              <div className="leading-tight">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-cream">
                  DSCR Calculator Pro
                </div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-brass">
                  Real Estate Investment Tools
                </div>
              </div>
            </Link>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="flex h-10 w-10 items-center justify-center border border-brass/15 text-cream transition-colors hover:border-brass/40 hover:bg-brass/5"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-1 px-6 pt-6">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 border border-brass/10 bg-ink-mid/40 px-5 py-4 text-[14px] font-bold uppercase tracking-[0.1em] text-cream transition-colors hover:border-brass/30 hover:bg-brass/10"
              >
                <span className="h-px w-5 bg-brass" aria-hidden />
                {l.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="px-6 pt-6">
            <a
              href="#download"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 bg-cream px-6 py-4 text-[13px] font-extrabold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-white"
            >
              Get App →
            </a>
          </div>

          {/* Footer */}
          <div className="mt-auto px-6 pb-8">
            <div className="border-t border-brass/10 pt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted/50">
              © {new Date().getFullYear()} DSCR Calculator Pro
            </div>
          </div>
        </div>
      )}
    </>
  );
}
