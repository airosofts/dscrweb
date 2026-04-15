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
      <nav
        className={
          "fixed left-1/2 top-4 z-50 w-[calc(100%-24px)] max-w-[980px] -translate-x-1/2 rounded-full border transition-all duration-300 " +
          (scrolled
            ? "border-brass/20 bg-ink/80 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            : "border-brass/10 bg-ink/40 backdrop-blur-md")
        }
      >
        <div className="flex h-14 items-center justify-between pl-4 pr-2">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream p-[3px] shadow-[0_2px_10px_rgba(0,0,0,0.25)] ring-1 ring-brass/20 transition-transform group-hover:scale-105">
              <LogoMark className="h-full w-full" />
            </span>
            <span className="hidden text-[12px] font-extrabold uppercase tracking-[0.16em] text-cream sm:inline">
              DSCR Calculator Pro
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full px-3.5 py-1.5 text-[12px] font-semibold tracking-[0.02em] text-cream/60 transition-all hover:bg-brass/10 hover:text-cream"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <a
              href="#download"
              className="hidden rounded-full bg-cream px-4 py-2 text-[12px] font-bold tracking-[-0.01em] text-ink transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_6px_16px_rgba(250,248,244,0.2)] sm:inline-flex"
            >
              Get App →
            </a>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-brass/15 text-cream transition-colors hover:border-brass/40 hover:bg-brass/5 md:hidden"
            >
              <span className="relative flex h-3 w-4 flex-col justify-between">
                <span
                  className={
                    "block h-[1.5px] w-full bg-cream transition-all " +
                    (open ? "translate-y-[5px] rotate-45" : "")
                  }
                />
                <span
                  className={
                    "block h-[1.5px] w-full bg-cream transition-all " +
                    (open ? "-translate-y-[6px] -rotate-45" : "")
                  }
                />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile sheet */}
      <div
        className={
          "fixed inset-0 z-40 bg-ink/95 backdrop-blur-xl transition-all duration-300 md:hidden " +
          (open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")
        }
      >
        <div className="flex h-full flex-col items-center justify-center gap-2 px-8">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="w-full rounded-2xl border border-brass/10 bg-ink-mid/60 px-6 py-5 text-center text-lg font-bold tracking-[-0.01em] text-cream transition-colors hover:border-brass/40 hover:bg-brass/10"
            >
              {l.label}
            </Link>
          ))}
          <a
            href="#download"
            onClick={() => setOpen(false)}
            className="mt-4 w-full rounded-2xl bg-cream px-6 py-5 text-center text-lg font-extrabold text-ink"
          >
            Get App →
          </a>
        </div>
      </div>
    </>
  );
}
