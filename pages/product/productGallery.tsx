"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  imgs?: string[];
}

const SWIPE_THRESHOLD = 50;

export default function ProductGallery({ imgs = [] }: ProductGalleryProps) {
  /* ───── slideshow state (mobile) ───── */
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  /* ───── lightbox state (desktop) ───── */
  const [lightbox, setLightbox] = useState<number | null>(null);

  const total = imgs.length;

  /* swipe handlers */
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setIsSwiping(true);
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (touchStart === null) return;
      setTouchDelta(e.touches[0].clientX - touchStart);
    },
    [touchStart]
  );

  const onTouchEnd = useCallback(() => {
    if (Math.abs(touchDelta) > SWIPE_THRESHOLD) {
      if (touchDelta < 0 && current < total - 1) setCurrent((p) => p + 1);
      if (touchDelta > 0 && current > 0) setCurrent((p) => p - 1);
    }
    setTouchStart(null);
    setTouchDelta(0);
    setIsSwiping(false);
  }, [touchDelta, current, total]);

  /* keyboard for lightbox */
  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((p) => Math.min((p ?? 0) + 1, total - 1));
      if (e.key === "ArrowLeft") setLightbox((p) => Math.max((p ?? 0) - 1, 0));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, total]);

  if (!total) return null;

  return (
    <>
      <div className="product-gallery-root">
        {/* ══ DESKTOP: 2-col grid ══ */}
        {imgs.length <= 2 && (
          <div className="hidden md:grid grid-cols-1 gap-1.5">
            {imgs.map((src, i) => (
              <div
                className="relative overflow-hidden rounded-lg aspect-square bg-muted cursor-zoom-in group"
                key={i}
                onClick={() => setLightbox(i)}
              >
                <Image
                  src={src}
                  alt={`Zdjęcie produktu ${i + 1}`}
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={i < 2}
                />
                <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  {i + 1}/{total}
                </span>
              </div>
            ))}
          </div>
        )}
        {imgs.length > 2 && (
          <div className="hidden md:grid grid-cols-2 gap-1.5">
            {imgs.map((src, i) => (
              <div
                className="relative overflow-hidden rounded-lg aspect-square bg-muted cursor-zoom-in group"
                key={i}
                onClick={() => setLightbox(i)}
              >
                <Image
                  src={src}
                  alt={`Zdjęcie produktu ${i + 1}`}
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={i < 2}
                />
                <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  {i + 1}/{total}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ══ MOBILE: touch slideshow ══ */}
        <div
          className="md:hidden relative overflow-hidden rounded-lg bg-muted touch-pan-y select-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className={`flex ${isSwiping ? '' : 'transition-transform duration-300 ease-out'}`}
            ref={trackRef}
            style={{
              transform: `translateX(calc(-${current * 100}% + ${isSwiping ? touchDelta : 0}px))`,
            }}
          >
            {imgs.map((src, i) => (
              <div className="min-w-full aspect-square relative" key={i}>
                <Image
                  src={src}
                  alt={`Zdjęcie produktu ${i + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority={i < 2}
                />
              </div>
            ))}
          </div>
          <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
            {current + 1} / {total}
          </span>
        </div>

        {/* dots (mobile only) */}
        <div className="flex md:hidden justify-center gap-2 py-4">
          {imgs.map((_, i) => (
            <button
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${i === current
                ? 'bg-foreground scale-125'
                : 'bg-muted-foreground/30'
                }`}
              onClick={() => setCurrent(i)}
              aria-label={`Slajd ${i + 1}`}
            />
          ))}
        </div>

        {/* ══ LIGHTBOX (desktop) ══ */}
        {lightbox !== null && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-in fade-in duration-200"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-4 right-6 text-white text-3xl hover:opacity-70 transition-opacity"
              onClick={() => setLightbox(null)}
              aria-label="Zamknij"
            >
              ✕
            </button>
            {lightbox > 0 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((p) => (p ?? 0) - 1);
                }}
                aria-label="Poprzednie zdjęcie"
              >
                ‹
              </button>
            )}
            <div className="relative max-w-[90vw] max-h-[88vh]" onClick={(e) => e.stopPropagation()}>
              <Image
                src={imgs[lightbox]}
                alt={`Zdjęcie produktu ${lightbox + 1}`}
                width={1200}
                height={1200}
                className="object-contain max-h-[88vh] rounded-md"
              />
            </div>
            {lightbox < total - 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((p) => (p ?? 0) + 1);
                }}
                aria-label="Następne zdjęcie"
              >
                ›
              </button>
            )}
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {lightbox + 1} / {total}
            </span>
          </div>
        )}
      </div>
    </>
  );
}
