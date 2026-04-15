import type { Metadata } from "next";
import { PricingClient } from "@/components/PricingClient";

export const metadata: Metadata = {
  title: "Pricing — Advertise on DSCR Calculator Pro",
  description:
    "Choose your ad placement and geo targeting. Instant checkout via Stripe — no contracts.",
  robots: { index: false, follow: false },
};

export default function PricingPage() {
  return <PricingClient />;
}
