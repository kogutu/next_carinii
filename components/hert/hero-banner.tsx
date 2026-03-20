'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const slides = [
  {
    desktop: 'https://www.hert.pl/media/ac_slider/slides/MKN_promo_.jpg',
    mobile: 'https://www.hert.pl/media/ac_slider/slides/MKN_Promo.png',
  },
  {
    desktop: 'https://www.hert.pl/media/ac_slider/slides/T_usty_czwartek.jpg',
    mobile: 'https://www.hert.pl/media/ac_slider/slides/t_usty_czwartek_mobile.png',
  }
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 9000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const goToSlide = (index: number) => {
    setCurrent(index);
    startTimer();
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
    startTimer();
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    startTimer();
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      <div className="relative overflow-hidden">
        <div className="relative aspect-[1600/507] md:aspect-[1600/507] aspect-square">

          {/* Renderujemy tylko aktualny slide */}
          <div className="absolute inset-0 transition-opacity duration-700 ease-in-out">
            <picture>
              <source
                media="(max-width: 767px)"
                srcSet={slides[current].mobile}
              />
              <source
                media="(min-width: 768px)"
                srcSet={slides[current].desktop}
              />
              <img
                src={slides[current].desktop}
                alt="Baner promocyjny"
                className="w-full h-full object-cover"
                loading={current === 0 ? 'eager' : 'lazy'}
                fetchPriority={current === 0 ? 'high' : 'auto'}
                decoding="async"
              />
            </picture>
          </div>
        </div>

        {/* Nawigacja */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
          aria-label="Poprzedni slajd"
        >
          ‹
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
          aria-label="Następny slajd"
        >
          ›
        </button>

        {/* Kropki */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`transition-all ${idx === current
                ? 'bg-white w-8 h-2 rounded-full'
                : 'bg-white/50 w-2 h-2 rounded-full'
                }`}
              aria-label={`Przejdź do slajdu ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
