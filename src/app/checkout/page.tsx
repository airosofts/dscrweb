import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CheckoutClient } from "@/components/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout — DSCR Calculator Pro",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
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
          <div className="mb-5 flex items-center justify-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-brass">
            <span className="h-px w-7 bg-brass" aria-hidden />
            Secure Checkout
          </div>
          <h1 className="mb-4 text-[42px] font-extrabold leading-[1.1] tracking-[-0.02em] text-cream max-[900px]:text-[34px] max-[480px]:text-[28px]">
            Complete Your Purchase
          </h1>
          <p className="mx-auto max-w-[480px] text-base leading-[1.65] text-muted">
            One-time payment. Your ad goes live within 24 hours of creative approval.
          </p>
        </div>
      </section>
      <section className="bg-cream py-16 max-[600px]:py-10">
        <div className="mx-auto max-w-[520px] px-6">
          <CheckoutClient />
        </div>
      </section>
      <Footer />
    </div>
  );
}
