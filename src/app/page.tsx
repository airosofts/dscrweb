import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { AppIcon } from "@/components/LogoMark";
import { StoreButtons } from "@/components/StoreButtons";
import { PhoneMockup } from "@/components/PhoneMockup";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 pb-[60px] pt-28 max-[480px]:px-5 max-[480px]:pb-10 max-[480px]:pt-24">
        <div className="grid w-full max-w-[1040px] grid-cols-[1fr_380px] items-center gap-16 max-[900px]:grid-cols-1 max-[900px]:gap-12 max-[900px]:text-center">
          <div className="flex flex-col max-[900px]:items-center">
            <AppIcon className="mb-6 h-[72px] w-[72px] rounded-2xl shadow-[0_6px_24px_rgba(0,0,0,0.3)]" />
            <div className="mb-1 text-sm font-extrabold uppercase tracking-[0.16em] text-cream">
              DSCR Calculator Pro
            </div>
            <div className="mb-8 text-[13px] tracking-[0.04em] text-muted">
              Debt Service Coverage Ratio
            </div>
            <h1 className="mb-3.5 text-[40px] font-extrabold leading-[1.12] tracking-[-0.02em] text-cream max-[900px]:text-[32px] max-[480px]:text-[28px]">
              Underwrite Deals
              <br />
              in Seconds
            </h1>
            <p className="mb-9 max-w-[420px] text-base leading-[1.65] text-muted max-[900px]:max-w-full">
              Professional DSCR calculator built for real estate investors. Free to download, no
              account required.
            </p>
            <div id="download">
              <StoreButtons />
            </div>
            <div className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-brass">
              Free — No Account Required
            </div>
          </div>
          <PhoneMockup />
        </div>
      </main>
      <Footer />
    </>
  );
}
