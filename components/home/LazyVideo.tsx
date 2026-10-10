'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

type LazyVideoProps = {
    mp4: string
    webm?: string
    poster?: string
    // wymiary pliku — rezerwują miejsce, więc strona nie skacze po załadowaniu wideo
    width: number
    height: number
    // media query, przy którym to wideo ma się w ogóle ładować (drugie, ukryte wideo nie pobiera nic)
    media: string
    // true = start zaraz po załadowaniu strony (wideo nad zgięciem; do tego czasu widać plakat);
    // false = dopiero gdy zbliża się do widoku
    eager?: boolean
    className?: string
}

const canSkipMotion = (): boolean => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches || Boolean(connection?.saveData)
}

// Wideo bez autoplay w HTML: źródło dostaje dopiero wtedy, gdy pasuje do ekranu i jest blisko widoku.
// Wcześniej obie wersje (desktop i telefon) pobierały się zawsze — ok. 26 MB na stronie głównej.
export default function LazyVideo({ mp4, webm, poster, width, height, media, eager = false, className }: LazyVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        const video = videoRef.current
        if (!video || canSkipMotion()) return

        const query = window.matchMedia(media)
        let observer: IntersectionObserver | null = null
        let started = false

        const start = () => {
            if (started || !query.matches) return
            started = true
            // mp4 jest mniejszy niż webm przy tej samej jakości, więc preferujemy go, gdy przeglądarka go obsługuje
            const source = video.canPlayType('video/mp4') ? mp4 : webm ?? mp4
            video.muted = true
            video.src = source
            video.play().catch(() => undefined)
        }

        const arm = () => {
            observer?.disconnect()
            if (!query.matches) return
            if (eager) {
                // plakat jest elementem LCP — wideo (kilka MB) startuje dopiero po załadowaniu strony,
                // żeby nie konkurować z nim o łącze
                if (document.readyState === 'complete') start()
                else window.addEventListener('load', start, { once: true })
                return
            }
            observer = new IntersectionObserver(
                (entries) => {
                    if (entries.some((entry) => entry.isIntersecting)) {
                        observer?.disconnect()
                        start()
                    }
                },
                { rootMargin: '300px' },
            )
            observer.observe(video)
        }

        arm()
        query.addEventListener('change', arm)
        return () => {
            observer?.disconnect()
            window.removeEventListener('load', start)
            query.removeEventListener('change', arm)
        }
    }, [mp4, webm, media, eager])

    return (
        <video
            ref={videoRef}
            className={cn('h-auto w-full bg-muted', className)}
            width={width}
            height={height}
            poster={poster}
            preload="none"
            muted
            loop
            playsInline
            aria-hidden="true"
        />
    )
}
