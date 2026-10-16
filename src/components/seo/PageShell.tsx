import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import {
  APP_STORE_URL,
  CONTENT_UPDATED,
  CONTENT_UPDATED_LABEL,
  SITE_NAME,
  absUrl,
  pageByPath,
} from "@/lib/site";

export type Faq = { q: string; a: React.ReactNode; text: string };
export type TocItem = { id: string; title: string };

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD must be raw; "<" is escaped so content can never close the tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/**
 * Layout for every guide and calculator page: ink hero with breadcrumb and
 * H1, optional tool band, a paper body with table of contents, FAQs,
 * related links, the app card and a disclaimer. Emits Article (or
 * WebApplication), BreadcrumbList and FAQPage structured data.
 */
export function PageShell({
  path,
  kicker,
  title,
  lede,
  tool,
  toc,
  faqs,
  related,
  schemaType = "Article",
  children,
}: {
  path: string;
  kicker: string;
  title: string;
  lede: React.ReactNode;
  tool?: React.ReactNode;
  toc?: TocItem[];
  faqs?: Faq[];
  related: string[];
  schemaType?: "Article" | "WebApplication";
  children: React.ReactNode;
}) {
  const url = absUrl(path);
  const page = pageByPath(path);
  const crumbs = [
    { name: "Home", url: absUrl("/") },
    ...(path === "/guides" ? [] : [{ name: page?.group === "calculators" ? "Calculators" : "Guides", url: absUrl("/guides") }]),
    { name: page?.label ?? title, url },
  ];

  const main =
    schemaType === "WebApplication"
      ? {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: title,
          url,
          applicationCategory: "FinanceApplication",
          operatingSystem: "Any (web browser)",
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          publisher: { "@id": `${absUrl("/")}#organization` },
        }
      : {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          url,
          mainEntityOfPage: url,
          dateModified: CONTENT_UPDATED,
          author: { "@type": "Organization", name: `${SITE_NAME} editorial team`, url: absUrl("/about") },
          publisher: { "@id": `${absUrl("/")}#organization` },
        };

  return (
    <div className="bg-cream">
      <Nav />
      <JsonLd data={main} />
      {path !== "/" && <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url })),
        }}
      />}
      {faqs && faqs.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.text } })),
          }}
        />
      )}

      {/* HERO */}
      <header className="site-chrome relative overflow-hidden bg-ink pb-14 pt-32 max-[900px]:pt-28">
        <div className="relative z-[2] mx-auto max-w-[1120px] px-6">
          {path !== "/" && <nav aria-label="Breadcrumb" className="mb-5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            <ol className="flex flex-wrap items-center gap-2">
              {crumbs.map((c, i) => (
                <li key={c.url} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden className="text-brass/50">/</span>}
                  {i < crumbs.length - 1 ? (
                    <Link href={c.url.replace(absUrl("/"), "") || "/"} className="hover:text-brass-pale">
                      {c.name}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-brass-pale">
                      {c.name}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>}
          <div className="mb-4 flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-brass">
            <span className="h-px w-7 bg-brass" aria-hidden />
            {kicker}
          </div>
          <h1 className="max-w-[820px] text-[44px] font-extrabold leading-[1.08] tracking-[-0.025em] text-cream [text-wrap:balance] max-[900px]:text-[34px] max-[480px]:text-[29px]">
            {title}
          </h1>
          <div className="mt-4 max-w-[640px] text-[17px] leading-[1.65] text-muted max-[480px]:text-[15px]">{lede}</div>
          <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted/80">
            Updated {CONTENT_UPDATED_LABEL} · By the {SITE_NAME} team ·{" "}
            <Link href="/methodology" className="text-brass-pale underline decoration-brass/40 underline-offset-2 hover:decoration-brass">
              How we calculate
            </Link>
          </div>
        </div>
      </header>

      {tool && (
        <section aria-label="Calculator" className="border-b border-rule bg-card-alt py-10 max-[600px]:py-6">
          <div className="mx-auto max-w-[1120px] px-6 max-[600px]:px-3">{tool}</div>
        </section>
      )}

      {/* BODY */}
      <div className="site-chrome mx-auto grid max-w-[1120px] grid-cols-[220px_1fr] gap-14 px-6 py-16 max-[960px]:grid-cols-1 max-[960px]:gap-8 max-[600px]:py-10">
        <aside className="max-[960px]:hidden">
          {toc && toc.length > 0 && (
            <div className="sticky top-28">
              <div className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-brass">On this page</div>
              <ul className="flex flex-col gap-2 border-l border-rule pl-4">
                {toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="text-[13px] leading-[1.4] text-slate transition-colors hover:text-ink">
                      {t.title}
                    </a>
                  </li>
                ))}
                {faqs && faqs.length > 0 && (
                  <li>
                    <a href="#faq" className="text-[13px] text-slate hover:text-ink">
                      FAQ
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </aside>

        <main className="min-w-0">
          <article className="prose-dscr">
            {children}

            {faqs && faqs.length > 0 && (
              <>
                <h2 id="faq">Frequently asked questions</h2>
                <div className="flex flex-col divide-y divide-rule border-y border-rule">
                  {faqs.map((f) => (
                    <details key={f.q} className="group py-4">
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[16px] font-bold text-ink">
                        {f.q}
                        <span aria-hidden className="mt-0.5 text-brass transition-transform group-open:rotate-45">+</span>
                      </summary>
                      <div className="mt-2 text-[15px] leading-[1.7] text-slate">{f.a}</div>
                    </details>
                  ))}
                </div>
              </>
            )}

            <p className="callout !mt-12 text-[13px] leading-[1.6]">
              <strong>Educational use only.</strong> {SITE_NAME} is not a lender and does not make loan offers.
              Figures on this page are typical market ranges and illustrative math; each lender sets its own
              guidelines and calculates your actual DSCR. See our{" "}
              <Link href="/advertiser-disclosure">advertiser disclosure</Link>.
            </p>
          </article>

          <Related paths={related} />
          <AppCard />
        </main>
      </div>

      <Footer />
    </div>
  );
}

export function Related({ paths }: { paths: string[] }) {
  const items = paths.map(pageByPath).filter(Boolean);
  if (!items.length) return null;
  return (
    <section aria-labelledby="related-h" className="mt-14">
      <h2 id="related-h" className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-brass">
        Keep going
      </h2>
      <ul className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
        {items.map((p) => (
          <li key={p!.path}>
            <Link
              href={p!.path}
              className="group flex h-full flex-col border border-rule bg-card p-4 transition-colors hover:border-brass/60"
            >
              <span className="text-[15px] font-bold text-ink group-hover:text-[#7a5f37]">{p!.label} →</span>
              <span className="mt-1 text-[13px] leading-[1.5] text-slate">{p!.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AppCard() {
  return (
    <aside className="mt-10 flex flex-wrap items-center justify-between gap-5 bg-ink p-6 text-cream">
      <div className="max-w-[460px]">
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-brass">Free iPhone app</div>
        <p className="mt-1.5 text-[17px] font-bold leading-[1.35]">Run any deal on your phone and share a lender-ready PDF.</p>
        <p className="mt-1 text-[13px] text-muted">Same math as this site. No account needed.</p>
      </div>
      <a href={APP_STORE_URL} className="inline-flex items-center gap-2.5 bg-cream px-5 py-3 text-ink transition-transform hover:-translate-y-0.5">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
        <span className="flex flex-col leading-none">
          <span className="text-[9px] font-medium text-slate">Download on the</span>
          <span className="mt-0.5 text-[15px] font-bold">App Store</span>
        </span>
      </a>
    </aside>
  );
}
