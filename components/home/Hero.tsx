"use client";

import { useRef, useState } from "react";
import { whatsappHref } from "@/lib/site";

function VolumeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function VolumeOnIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  return (
    <>
      {/* Hero section - deep teal */}
      <section className="overflow-hidden bg-[#073B38]">
        <div className="max-w-[1360px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:min-h-[460px]">

            {/* Left — text, 43% on desktop */}
            <div className="flex flex-col justify-center px-5 pb-7 pt-8 sm:px-9 lg:w-[43%] lg:px-[5%] lg:py-[56px]">

              {/* label */}
              <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#F0A52E] sm:text-[14px] lg:text-[16px]">
                Ergonomic seating · Made for long hours
              </p>

              {/* H1 */}
              <h1 className="font-display mt-5 text-[42px] font-semibold leading-[1.07] tracking-tight text-[#FFF9F0] sm:text-[52px] lg:text-[70px]">
                Built for the<br />long day.<br />
                <em className="italic text-[#E8AD4D]">Sold on facts.</em>
              </h1>

              {/* gold underline accent */}
              <div className="mt-4 h-[2px] w-14 rounded-full bg-[#E8AD4D] lg:mt-5" />

              {/* description */}
              <p className="mt-5 text-[15px] leading-[1.75] text-[#FFF9F0]/65 lg:text-[17px]">
                Every NexChair ships with its full specification sheet -
                dimensions, mechanism, load rating and warranty - so you choose
                on facts, not adjectives.
              </p>

              {/* CTA buttons */}
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="/product-range" className="inline-flex items-center rounded-full bg-[#D85B13] px-7 py-[11px] text-[14px] font-bold text-white transition-all duration-200 hover:bg-[#c0500f] active:scale-[0.98] lg:text-[15px]" style={{ minHeight: 46, boxShadow: "0 4px 16px rgba(216,91,19,0.38), 0 1px 4px rgba(0,0,0,0.10)" }}>
                  Explore the range
                </a>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-[14px] font-bold text-[#FFF9F0] transition hover:border-white/40 hover:bg-white/8 lg:text-[15px]" style={{ minHeight: 46 }}>
                  <svg className="h-4 w-4 shrink-0 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Right — hero video, floats with breathing room on all sides */}
            <div className="flex-1 px-4 pb-5 pt-4 sm:px-6 sm:pb-7 sm:pt-5 lg:pb-12 lg:pl-6 lg:pr-14 lg:pt-[56px]">
              <div className="relative h-[190px] sm:h-[250px] lg:h-full">
                {/* gold border — all 4 sides, asymmetric radii */}
                <div className="pointer-events-none absolute inset-0 z-10 rounded-bl-[56px] rounded-br-[20px] rounded-tl-[56px] rounded-tr-[20px] border-2 border-[#E8AD4D]/50 lg:rounded-bl-[84px] lg:rounded-br-[28px] lg:rounded-tl-[84px] lg:rounded-tr-[28px]" aria-hidden="true" />
                {/* video clip container */}
                <div className="relative h-full overflow-hidden rounded-bl-[56px] rounded-br-[20px] rounded-tl-[56px] rounded-tr-[20px] bg-[#073B38] shadow-[0_10px_56px_rgba(0,0,0,0.50)] lg:rounded-bl-[84px] lg:rounded-br-[28px] lg:rounded-tl-[84px] lg:rounded-tr-[28px]">
                  <video
                    ref={videoRef}
                    src="/home-page-vid2.mp4"
                    poster="/images/hero-image.png"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={isMuted ? "Unmute video" : "Mute video"}
                    className="absolute bottom-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                  >
                    {isMuted ? <VolumeOffIcon /> : <VolumeOnIcon />}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Trust / Statistics banner ───────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #092F30 0%, #073B38 48%, #0a3c39 100%)",
        }}
      >
        {/* Radial center glow */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse at 28% 55%, rgba(21,80,75,0.6) 0%, transparent 58%)",
          }}
        />

        {/* Decorative gold arcs */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1360 210"
          preserveAspectRatio="none"
          aria-hidden="true"
          fill="none"
        >
          <path
            d="M -80 55 C 150 5 480 95 780 42 C 1020 5 1180 68 1440 28"
            stroke="#E9A83D"
            strokeWidth="1.8"
            opacity="0.30"
          />
          <path
            d="M 820 220 C 980 165 1150 192 1440 165"
            stroke="#E9A83D"
            strokeWidth="1.4"
            opacity="0.17"
          />
        </svg>

        <div className="relative mx-auto max-w-[1360px] px-5 sm:px-9">

          {/* Mobile & tablet — compact horizontal row */}
          <div className="flex items-center justify-around py-7 lg:hidden">

            <div className="flex flex-col items-center gap-1.5 text-center">
              <svg className="h-9 w-9 text-[#F0A52E] sm:h-10 sm:w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <p className="font-display text-[28px] font-semibold leading-none text-white sm:text-[32px]">1 year</p>
              <p className="text-[12px] font-medium text-white/80 sm:text-[13px]">Warranty</p>
            </div>

            <div className="h-[52px] w-px shrink-0 bg-[#F0A52E]/45" aria-hidden="true" />

            <div className="flex flex-col items-center gap-1.5 text-center">
              <svg className="h-9 w-9 text-[#F0A52E] sm:h-10 sm:w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <p className="font-display text-[28px] font-semibold leading-none text-white sm:text-[32px]">13+</p>
              <p className="text-[12px] font-medium text-white/80 sm:text-[13px]">Years in seating</p>
            </div>

            <div className="h-[52px] w-px shrink-0 bg-[#F0A52E]/45" aria-hidden="true" />

            <div className="flex flex-col items-center gap-1.5 text-center">
              <svg className="h-9 w-9 text-[#F0A52E] sm:h-10 sm:w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <p className="font-display text-[28px] font-semibold leading-none text-white sm:text-[32px]">Pan-India</p>
              <p className="text-[12px] font-medium text-white/80 sm:text-[13px]">Delivery</p>
            </div>

          </div>

          {/* Desktop — three equal columns, 210px tall */}
          <div className="hidden h-[210px] items-center lg:flex">

            {/* Col 1 — Warranty */}
            <div className="flex flex-1 items-center justify-center gap-8 px-6">
              <svg
                className="h-[54px] w-[54px] shrink-0 text-[#F0A52E]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <div>
                <p className="font-display text-[54px] font-semibold leading-none tracking-[-0.5px] text-white">
                  1 year
                </p>
                <p className="mt-1.5 text-[20px] font-medium text-white/90">Warranty</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-[115px] w-px shrink-0" style={{ background: "rgba(240,165,46,0.55)" }} aria-hidden="true" />

            {/* Col 2 — Years in seating */}
            <div className="flex flex-1 items-center justify-center gap-8 px-6">
              <svg
                className="h-[54px] w-[54px] shrink-0 text-[#F0A52E]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <div>
                <p className="font-display text-[54px] font-semibold leading-none tracking-[-0.5px] text-white">
                  13+
                </p>
                <p className="mt-1.5 text-[20px] font-medium text-white/90">Years in seating</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-[115px] w-px shrink-0" style={{ background: "rgba(240,165,46,0.55)" }} aria-hidden="true" />

            {/* Col 3 — Delivery */}
            <div className="flex flex-1 items-center justify-center gap-8 px-6">
              <svg
                className="h-[54px] w-[54px] shrink-0 text-[#F0A52E]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <div>
                <p className="font-display text-[54px] font-semibold leading-none tracking-[-0.5px] text-white">
                  Pan-India
                </p>
                <p className="mt-1.5 text-[20px] font-medium text-white/90">Delivery</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
