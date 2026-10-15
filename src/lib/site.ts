/**
 * Single source of truth for the public, indexable pages.
 * Drives the sitemap, the guides hub, nav, footer and "related" links.
 *
 * Advertiser flow pages (/advertise, /pricing, /checkout, /submit-creative,
 * /payment-success) are deliberately NOT listed here — they stay reachable
 * from emails but are kept out of navigation and search.
 */

export const SITE_URL = "https://dscrcalculator.pro";
export const SITE_NAME = "DSCR Calculator Pro";
export const APP_STORE_ID = "6759057051";
export const APP_STORE_URL = `https://apps.apple.com/us/app/dscr-calculator-pro/id${APP_STORE_ID}`;

/** Shown on every guide as "Updated …". Bump when content is reviewed. */
export const CONTENT_UPDATED = "2026-10-15";
export const CONTENT_UPDATED_LABEL = "October 2026";

export type PageGroup = "calculators" | "guides" | "company";

export type SitePage = {
  path: string;
  /** Short label for nav, hub cards and related links. */
  label: string;
  /** One-sentence summary for hub cards. */
  blurb: string;
  group: PageGroup;
  priority: number;
};

export const PAGES: SitePage[] = [
  { path: "/", label: "DSCR Calculator", blurb: "Lender and NOI methods, interest-only, max loan and break-even rent.", group: "calculators", priority: 1 },
  { path: "/dscr-loan-amount-calculator", label: "DSCR Loan Amount Calculator", blurb: "How much a rental's income lets you borrow at a target DSCR.", group: "calculators", priority: 0.9 },
  { path: "/rental-property-cash-flow-calculator", label: "Rental Cash Flow Calculator", blurb: "Monthly cash flow after vacancy, expenses, reserves and the mortgage.", group: "calculators", priority: 0.8 },
  { path: "/cap-rate-calculator", label: "Cap Rate Calculator", blurb: "Net operating income as a percentage of purchase price.", group: "calculators", priority: 0.7 },
  { path: "/cash-on-cash-return-calculator", label: "Cash-on-Cash Return Calculator", blurb: "Annual cash flow against the cash you actually put in.", group: "calculators", priority: 0.7 },

  { path: "/dscr-formula", label: "DSCR Formula", blurb: "How to calculate DSCR step by step, with worked examples.", group: "guides", priority: 0.9 },
  { path: "/dscr-loan", label: "What Is a DSCR Loan?", blurb: "How DSCR loans work, who they're for, pros and cons.", group: "guides", priority: 0.9 },
  { path: "/dscr-loan-requirements", label: "DSCR Loan Requirements", blurb: "Typical minimum DSCR, credit, down payment, reserves and property rules.", group: "guides", priority: 0.9 },
  { path: "/what-is-a-good-dscr", label: "What Is a Good DSCR?", blurb: "What 0.75, 1.0, 1.2 and 1.25 mean to a lender.", group: "guides", priority: 0.8 },
  { path: "/how-to-improve-dscr", label: "How to Improve Your DSCR", blurb: "Eight levers that raise your ratio before you apply.", group: "guides", priority: 0.7 },
  { path: "/dscr-loan-down-payment", label: "DSCR Loan Down Payment", blurb: "How much down a DSCR loan takes and how it changes your ratio.", group: "guides", priority: 0.7 },
  { path: "/interest-only-dscr-loan", label: "Interest-Only DSCR Loans", blurb: "How interest-only payments raise DSCR, and what they cost later.", group: "guides", priority: 0.7 },
  { path: "/short-term-rental-dscr-loan", label: "Short-Term Rental DSCR Loans", blurb: "How lenders count Airbnb and VRBO income.", group: "guides", priority: 0.7 },
  { path: "/dscr-vs-conventional-loan", label: "DSCR vs Conventional Loans", blurb: "Side-by-side: qualification, rates, limits and when each wins.", group: "guides", priority: 0.7 },
  { path: "/dscr-glossary", label: "DSCR Glossary", blurb: "PITIA, NOI, LTV, seasoning, prepayment penalties and more.", group: "guides", priority: 0.6 },

  { path: "/guides", label: "All Guides & Calculators", blurb: "Everything on DSCR Calculator Pro in one place.", group: "company", priority: 0.6 },
  { path: "/app", label: "iPhone App", blurb: "Save deals, export PDFs and run DSCR offline.", group: "company", priority: 0.6 },
  { path: "/methodology", label: "Methodology", blurb: "Exactly how every number on this site is calculated.", group: "company", priority: 0.5 },
  { path: "/about", label: "About", blurb: "Who builds DSCR Calculator Pro and why.", group: "company", priority: 0.4 },
  { path: "/advertiser-disclosure", label: "Advertiser Disclosure", blurb: "How we make money and how it does not affect our content.", group: "company", priority: 0.3 },
  { path: "/contact", label: "Contact", blurb: "Get in touch with the team.", group: "company", priority: 0.3 },
  { path: "/privacy", label: "Privacy Policy", blurb: "What we collect and what we don't.", group: "company", priority: 0.2 },
  { path: "/terms", label: "Terms of Use", blurb: "The rules for using this site.", group: "company", priority: 0.2 },
];

export const pageByPath = (path: string) => PAGES.find((p) => p.path === path);
export const pagesIn = (group: PageGroup) => PAGES.filter((p) => p.group === group);
export const absUrl = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;
