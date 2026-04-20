import type { Metadata } from "next";
import { Suspense } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CreativeSubmitClient } from "@/components/CreativeSubmitClient";

export const metadata: Metadata = {
  title: "Submit Ad Creative — DSCR Calculator Pro",
  description: "Upload your ad creative for review.",
};

export default function SubmitCreativePage() {
  return (
    <div className="bg-cream">
      <Nav />

      {/* HERO */}
      <section className="relative overflow-hidden bg-ink pb-20 pt-36 max-[900px]:pt-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(155,123,78,0.03) 59px,rgba(155,123,78,0.03) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(155,123,78,0.03) 59px,rgba(155,123,78,0.03) 60px)",
          }}
        />
        <div className="relative z-[2] mx-auto max-w-[1040px] px-6">
          <div className="mb-5 flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-brass">
            <span className="h-px w-7 bg-brass" aria-hidden />
            Creative Submission
          </div>
          <h1 className="mb-4 text-[42px] font-extrabold leading-[1.1] tracking-[-0.02em] text-cream max-[900px]:text-[34px] max-[480px]:text-[28px]">
            Upload Your Ad Creative
          </h1>
          <p className="max-w-[560px] text-base leading-[1.65] text-muted">
            Submit your banner images, logos, and campaign details. We review creative within 1-2
            business days and notify you once approved.
          </p>
        </div>
      </section>

      {/* MAIN */}
      <section className="bg-cream py-20 max-[600px]:py-14">
        <div className="mx-auto max-w-[720px] px-6">
          <Suspense
            fallback={
              <div className="border border-rule border-l-[3px] border-l-brass bg-card p-8">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  Loading...
                </div>
              </div>
            }
          >
            <CreativeSubmitClient />
          </Suspense>
        </div>
      </section>

      <Footer />
    </div>
  );
}
