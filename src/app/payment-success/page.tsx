import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Payment Confirmed — DSCR Calculator Pro",
  robots: { index: false, follow: false },
};

export default function PaymentSuccessPage() {
  return (
    <div className="bg-cream">
      <Nav />

      <section className="relative overflow-hidden bg-ink pb-20 pt-36 max-[900px]:pt-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(155,123,78,0.03) 59px,rgba(155,123,78,0.03) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(155,123,78,0.03) 59px,rgba(155,123,78,0.03) 60px)",
          }}
        />
        <div className="relative z-[2] mx-auto max-w-[720px] px-6 text-center">
          {/* Success icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-green-300 bg-green-50">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-green-600">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </div>

          <div className="mb-5 flex items-center justify-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-brass">
            <span className="h-px w-7 bg-brass" aria-hidden />
            Payment Confirmed
          </div>
          <h1 className="mb-4 text-[42px] font-extrabold leading-[1.1] tracking-[-0.02em] text-cream max-[900px]:text-[34px] max-[480px]:text-[28px]">
            You&apos;re all set.
          </h1>
          <p className="mx-auto max-w-[480px] text-base leading-[1.65] text-muted">
            Your payment has been received. We&apos;ll send you an email within
            24 hours with a link to submit your ad creative.
          </p>
        </div>
      </section>

      <section className="bg-cream py-20 max-[600px]:py-14">
        <div className="mx-auto max-w-[600px] px-6">
          {/* Steps card */}
          <div className="border border-rule border-l-[3px] border-l-brass bg-card p-8 max-[600px]:p-6">
            <div className="mb-6 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-brass">
              What Happens Next
            </div>

            <div className="flex flex-col gap-6">
              <Step num="01" title="Check your email" desc="We'll send a creative submission link within 24 hours to the email you used at checkout." />
              <Step num="02" title="Submit your ad creative" desc="Upload your banner image (320×50) or pop-up content through the submission link." />
              <Step num="03" title="We review & approve" desc="Creative approval takes 1–2 business days. We'll confirm via email when it's live." />
              <Step num="04" title="Your ad goes live" desc="Your placement starts serving to investors nationwide. Track performance in your dashboard." />
            </div>
          </div>

          {/* Support note */}
          <div className="mt-6 border border-rule bg-card-alt p-6 text-center">
            <p className="text-[14px] text-slate">
              Questions about your order? Email us at{" "}
              <a href="mailto:advertise@dscrcalculator.pro" className="font-semibold text-brass hover:text-brass-light">
                advertise@dscrcalculator.pro
              </a>
            </p>
          </div>

          {/* Back links */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/" className="btn-outline-brass">Back to Home</Link>
            <Link href="/advertise" className="btn-outline-brass">Advertise</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-rule bg-card-alt font-mono text-[12px] font-bold text-brass">
        {num}
      </div>
      <div>
        <div className="text-[14px] font-bold text-ink">{title}</div>
        <div className="mt-1 text-[13px] leading-[1.55] text-slate">{desc}</div>
      </div>
    </div>
  );
}
