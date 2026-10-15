import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import VisitTracker from "@/components/VisitTracker";
import { JsonLd } from "@/components/seo/PageShell";
import { APP_STORE_ID, APP_STORE_URL, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — Free DSCR Calculator`, template: `%s | ${SITE_NAME}` },
  description:
    "Free DSCR calculator for rental property loans. Debt service coverage ratio, max loan and break-even rent. No signup.",
  applicationName: SITE_NAME,
  // Safari's native Smart App Banner — not an interstitial, so safe for SEO.
  itunes: { appId: APP_STORE_ID },
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable}`}>
      <body suppressHydrationWarning>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": `${SITE_URL}#organization`,
                name: SITE_NAME,
                url: SITE_URL,
                logo: `${SITE_URL}/icon.svg`,
                sameAs: [APP_STORE_URL],
              },
              {
                "@type": "WebSite",
                "@id": `${SITE_URL}#website`,
                name: SITE_NAME,
                url: SITE_URL,
                publisher: { "@id": `${SITE_URL}#organization` },
              },
            ],
          }}
        />
        <VisitTracker/>
        {children}
      </body>
    </html>
  );
}
