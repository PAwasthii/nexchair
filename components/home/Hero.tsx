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
    <section className="px-4 pt-4 pb-3 md:px-6 md:pt-5 md:pb-4">
      <div className="mx-auto max-w-7xl rounded-3xl bg-[#f5f1ea] p-8 md:p-14">
        <div className="grid items-center gap-10 md:grid-cols-2">
          {/* Left */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F26919]">
              Ergonomic seating · Made for long hours
            </p>

            <h1 className="mt-5 text-4xl font-bold leading-snug tracking-tight sm:text-5xl sm:leading-tight md:text-7xl md:leading-[1.1]">
              <span className="block">Built for the long day.</span>
              <span>Sold on facts.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-black/60">
              Every NexChair ships with its full specification sheet -
              dimensions, mechanism, load rating and warranty - so you choose
              on facts, not adjectives.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/product-range"
                className="rounded-full bg-[#0E3159] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0a2647]"
              >
                Explore the range
              </a>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-[#1aad4b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#158a3c]"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Chat on WhatsApp
              </a>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-black/10 pt-6">
              <div>
                <p className="text-lg font-bold">1 year</p>
                <p className="mt-1 text-xs text-black/50">Warranty</p>
              </div>

              <div>
                <p className="text-lg font-bold">13+</p>
                <p className="mt-1 text-xs text-black/50">Years in seating</p>
              </div>

              <div>
                <p className="text-lg font-bold">Pan-India</p>
                <p className="mt-1 text-xs text-black/50">Delivery</p>
              </div>
            </div>
          </div>

          {/* Right — hero video */}
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl md:aspect-auto md:min-h-[420px]">
            <video
              ref={videoRef}
              src="/home-page-vid2.mp4"
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
              className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              {isMuted ? <VolumeOffIcon /> : <VolumeOnIcon />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
