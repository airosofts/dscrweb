import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact — DSCR Calculator Pro",
  description:
    "Get in touch with the DSCR Calculator Pro team. Support, advertising, press, and partnership inquiries.",
};

export default function ContactPage() {
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
            Contact
          </div>
          <h1 className="mb-4 text-[42px] font-extrabold leading-[1.1] tracking-[-0.02em] text-cream max-[900px]:text-[34px] max-[480px]:text-[28px]">
            Talk to the Team
          </h1>
          <p className="max-w-[560px] text-base leading-[1.65] text-muted">
            Every email is read by a human — we reply within 3–4 business days. For
            time-sensitive app issues, include your device and app version so we can reproduce
            faster.
          </p>
        </div>
      </section>

      {/* MAIN */}
      <section className="bg-cream py-20 max-[600px]:py-14">
        <div className="mx-auto grid max-w-[1040px] grid-cols-[1fr_320px] gap-16 px-6 max-[900px]:grid-cols-1 max-[900px]:gap-10">
          {/* FORM */}
          <div>
            <h2 className="mb-4 border-b border-rule pb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-ink">
              Send a Message
            </h2>
            <ContactForm />
          </div>

          {/* RESPONSE */}
          <aside>
            <div className="border border-rule border-l-[3px] border-l-brass bg-card p-6">
              <div className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-brass">
                Response Time
              </div>
              <p className="text-[13px] leading-[1.6] text-slate">
                We reply to every email within{" "}
                <strong className="text-ink">3–4 business days</strong>. Critical app outages are
                acknowledged within two hours.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
}
