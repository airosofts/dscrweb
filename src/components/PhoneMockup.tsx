import Image from "next/image";

export function PhoneMockup() {
  return (
    <div className="relative flex justify-center max-[900px]:-order-1">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(155,123,78,0.14)_0%,transparent_65%)]"
      />
      {/* Floor reflection */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-40px] left-1/2 h-6 w-[260px] -translate-x-1/2 rounded-full bg-black/50 blur-2xl"
      />

      <div
        className="relative"
        style={{ width: 340, filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.55))" }}
      >
        {/* Titanium outer frame */}
        <div
          className="relative rounded-[58px] p-[3px]"
          style={{
            background:
              "linear-gradient(145deg, #3a3a3f 0%, #1a1a1d 25%, #2a2a2e 50%, #121214 75%, #2e2e32 100%)",
            boxShadow:
              "0 0 0 1px rgba(155,123,78,0.08), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.4)",
          }}
        >
          {/* Inner bezel */}
          <div
            className="relative rounded-[55px] p-[8px]"
            style={{
              background: "linear-gradient(145deg, #0a0a0b 0%, #1c1c1f 50%, #0a0a0b 100%)",
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.8)",
            }}
          >
            {/* Screen */}
            <div
              className="relative overflow-hidden rounded-[47px] bg-cream"
              style={{ aspectRatio: "9 / 19.5" }}
            >
              <Image
                src="/2.png"
                alt="DSCR Calculator Pro app screen"
                fill
                sizes="(max-width: 900px) 320px, 340px"
                className="object-cover object-top"
                priority
              />

              {/* Dynamic Island overlay */}
              <div
                className="absolute left-1/2 top-[9px] z-20 flex h-[26px] w-[95px] -translate-x-1/2 items-center justify-end rounded-full pr-2.5"
                style={{
                  background: "#000",
                  boxShadow:
                    "inset 0 0 0 1px rgba(40,40,44,0.9), 0 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                <span
                  aria-hidden
                  className="h-[7px] w-[7px] rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle at 35% 35%, #2a2f38 0%, #0a0d12 55%, #000 100%)",
                    boxShadow:
                      "inset 0 0 1px rgba(60,80,120,0.5), 0 0 0 0.5px rgba(255,255,255,0.04)",
                  }}
                />
              </div>

              {/* Home indicator */}
              <div className="absolute bottom-1.5 left-1/2 z-20 h-1 w-[100px] -translate-x-1/2 rounded-full bg-ink/30" />
            </div>
          </div>
        </div>

        {/* Side buttons */}
        <span
          aria-hidden
          className="absolute -left-[3px] top-[110px] h-8 w-[3px] rounded-l-sm"
          style={{ background: "linear-gradient(90deg, #1a1a1d, #3a3a3f)" }}
        />
        <span
          aria-hidden
          className="absolute -left-[3px] top-[160px] h-14 w-[3px] rounded-l-sm"
          style={{ background: "linear-gradient(90deg, #1a1a1d, #3a3a3f)" }}
        />
        <span
          aria-hidden
          className="absolute -left-[3px] top-[230px] h-14 w-[3px] rounded-l-sm"
          style={{ background: "linear-gradient(90deg, #1a1a1d, #3a3a3f)" }}
        />
        <span
          aria-hidden
          className="absolute -right-[3px] top-[180px] h-20 w-[3px] rounded-r-sm"
          style={{ background: "linear-gradient(270deg, #1a1a1d, #3a3a3f)" }}
        />
      </div>
    </div>
  );
}
