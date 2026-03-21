"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/**
 * ProductGallery
 *
 * Props:
 *   imgs – string[] of image URLs
 *
 * Desktop  → 2-column masonry-style grid (all images visible)
 * Mobile   → full-width touch slideshow with dots + swipe
 */

const SWIPE_THRESHOLD = 50;

export default function ProductGallery({ imgs = [] }) {
  /* ───── slideshow state (mobile) ───── */
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const trackRef = useRef(null);

  /* ───── lightbox state (desktop) ───── */
  const [lightbox, setLightbox] = useState(null);

  const total = imgs.length;

  /* swipe handlers */
  const onTouchStart = useCallback((e) => {
    setTouchStart(e.touches[0].clientX);
    setIsSwiping(true);
  }, []);

  const onTouchMove = useCallback(
    (e) => {
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
    const handler = (e) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((p) => Math.min(p + 1, total - 1));
      if (e.key === "ArrowLeft") setLightbox((p) => Math.max(p - 1, 0));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, total]);

  if (!total) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap');

        .pg-root {
          --pg-radius: 10px;
          --pg-gap: 6px;
          --pg-accent: #111;
          --pg-dot: #ccc;
          --pg-dot-active: #111;
          font-family: 'DM Sans', sans-serif;
        }

        /* ════════ DESKTOP GRID ════════ */
        .pg-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--pg-gap);
        }
        .pg-grid-item {
          position: relative;
          overflow: hidden;
          border-radius: var(--pg-radius);
          aspect-ratio: 2 / 3;
          background: #f5f5f5;
          cursor: zoom-in;
        }
        .pg-grid-item img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          transition: transform .35s cubic-bezier(.25,.46,.45,.94);
          filter:brightness(0.96)
        }
        .pg-grid-item:hover img {
          transform: scale(1.04);
        }
        /* subtle overlay on hover */
        .pg-grid-item::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0);
          transition: background .3s;
          pointer-events: none;
          border-radius: var(--pg-radius);
        }
        .pg-grid-item:hover::after {
          background: rgba(0,0,0,.04);
        }
        /* counter badge */
        .pg-badge {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(0,0,0,.55);
          color: #fff;
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 20px;
          letter-spacing: .3px;
          pointer-events: none;
        }

        /* ════════ MOBILE SLIDESHOW ════════ */
        .pg-slideshow {
          display: none;
          position: relative;
          overflow: hidden;
          border-radius: var(--pg-radius);
          background: #f5f5f5;
          touch-action: pan-y;
          -webkit-user-select: none;
          user-select: none;
        }
        .pg-track {
          display: flex;
          transition: transform .35s cubic-bezier(.4,0,.2,1);
        }
        .pg-track.swiping {
          transition: none;
        }
        .pg-slide {
          min-width: 100%;
          aspect-ratio:2 / 3;
        }
        .pg-slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          pointer-events: none;
    filter: brightness(0.96);
        }

        /* dots */
        .pg-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          padding: 14px 0 6px;
        }
        .pg-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--pg-dot);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: background .25s, transform .25s;
        }
        .pg-dot.active {
          background: var(--pg-dot-active);
          transform: scale(1.35);
        }

        /* fraction counter for mobile */
        .pg-fraction {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(0,0,0,.5);
          color: #fff;
          font-size: 12px;
          padding: 3px 10px;
          border-radius: 20px;
          letter-spacing: .5px;
          pointer-events: none;
        }

        /* ════════ LIGHTBOX ════════ */
        .pg-lightbox {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0,0,0,.92);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pgFadeIn .2s ease;
        }
        @keyframes pgFadeIn {
          from { opacity: 0 } to { opacity: 1 }
        }
        .pg-lightbox img {
          max-width: 90vw;
          max-height: 88vh;
          object-fit: contain;
          border-radius: 6px;
        }
        .pg-lb-close {
          position: absolute;
          top: 18px;
          right: 22px;
          background: none;
          border: none;
          color: #fff;
          font-size: 28px;
          cursor: pointer;
          line-height: 1;
          opacity: .7;
          transition: opacity .2s;
        }
        .pg-lb-close:hover { opacity: 1 }
        .pg-lb-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,.12);
          border: none;
          color: #fff;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background .2s;
        }
        .pg-lb-nav:hover { background: rgba(255,255,255,.25) }
        .pg-lb-prev { left: 16px }
        .pg-lb-next { right: 16px }
        .pg-lb-counter {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(255,255,255,.6);
          font-size: 13px;
        }

        /* ════════ RESPONSIVE SWITCH ════════ */
        @media (max-width: 768px) {
          .pg-grid { display: none; }
          .pg-slideshow { display: block; }
        }
        @media (min-width: 769px) {
          .pg-grid { display: grid; }
          .pg-slideshow { display: none; }
        }
      `}</style>

      <div className="pg-root">
        {/* ══ DESKTOP: 2-col grid ══ */}
        <div className="pg-grid">
          {imgs.map((src, i) => (
            <div
              className="pg-grid-item"
              key={i}
              onClick={() => setLightbox(i)}
            >
              <img src={src} alt={`Product ${i + 1}`} loading="lazy" />
              <span className="pg-badge">{i + 1}/{total}</span>
            </div>
          ))}
        </div>

        {/* ══ MOBILE: touch slideshow ══ */}
        <div
          className="pg-slideshow"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className={`pg-track${isSwiping ? " swiping" : ""}`}
            ref={trackRef}
            style={{
              transform: `translateX(calc(-${current * 100}% + ${isSwiping ? touchDelta : 0}px))`,
            }}
          >
            {imgs.map((src, i) => (
              <div className="pg-slide" key={i}>
                <img src={src} alt={`Product ${i + 1}`} loading={i < 2 ? "eager" : "lazy"} />
              </div>
            ))}
          </div>
          <span className="pg-fraction">
            {current + 1} / {total}
          </span>
        </div>

        {/* dots (mobile only, rendered below slideshow) */}
        <div className="pg-dots" style={{ display: "none" }}>
          {imgs.map((_, i) => (
            <button
              key={i}
              className={`pg-dot${i === current ? " active" : ""}`}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
        <style>{`
          @media (max-width: 768px) {
            .pg-dots { display: flex !important; }
          }
        `}</style>

        {/* ══ LIGHTBOX (desktop) ══ */}
        {lightbox !== null && (
          <div className="pg-lightbox" onClick={() => setLightbox(null)}>
            <button className="pg-lb-close" onClick={() => setLightbox(null)}>
              ✕
            </button>
            {lightbox > 0 && (
              <button
                className="pg-lb-nav pg-lb-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((p) => p - 1);
                }}
              >
                ‹
              </button>
            )}
            <img
              src={imgs[lightbox]}
              alt={`Product ${lightbox + 1}`}
              onClick={(e) => e.stopPropagation()}
            />
            {lightbox < total - 1 && (
              <button
                className="pg-lb-nav pg-lb-next"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((p) => p + 1);
                }}
              >
                ›
              </button>
            )}
            <span className="pg-lb-counter">
              {lightbox + 1} / {total}
            </span>
          </div>
        )}
      </div>
    </>
  );
}