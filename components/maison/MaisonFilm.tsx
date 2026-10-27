"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

type MaisonFilmProps = {
    src: string
    poster: string
    label: string
    // nagłówek i przycisk leżące na filmie
    children?: ReactNode
    preload?: "auto" | "metadata"
}

const SOUND_EVENT = "maison:sound"

// Film kampanii: wyciszony autoplay w pętli, dźwięk włącza przycisk. Tylko jeden film naraz ma dźwięk.
export default function MaisonFilm({ src, poster, label, children, preload = "metadata" }: MaisonFilmProps) {
    const video = useRef<HTMLVideoElement>(null)
    const [soundOn, setSoundOn] = useState(false)
    const [reduceMotion, setReduceMotion] = useState(false)

    useEffect(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        setReduceMotion(reduce)
        if (reduce) video.current?.pause()

        const muteWhenOtherPlays = (event: Event) => {
            if ((event as CustomEvent).detail === video.current) return
            if (video.current) video.current.muted = true
            setSoundOn(false)
        }
        window.addEventListener(SOUND_EVENT, muteWhenOtherPlays)
        return () => window.removeEventListener(SOUND_EVENT, muteWhenOtherPlays)
    }, [])

    const toggleSound = () => {
        const element = video.current
        if (!element) return
        const next = element.muted
        if (next) window.dispatchEvent(new CustomEvent(SOUND_EVENT, { detail: element }))
        element.muted = !next
        if (next) element.play().catch(() => {})
        setSoundOn(next)
    }

    return (
        <section aria-label={label}>
            <div className="mz-film">
                {children}
                <video
                    ref={video}
                    src={src}
                    poster={poster}
                    autoPlay={!reduceMotion}
                    muted
                    loop
                    playsInline
                    preload={preload}
                    controls={reduceMotion}
                    aria-label={label}
                />
            </div>
            <div className="mz-film-bar mz-wrap">
                <span>Kampania — Kolekcja 01</span>
                <button type="button" onClick={toggleSound} aria-pressed={soundOn}>
                    Dźwięk: {soundOn ? "włączony" : "wyłączony"}
                </button>
            </div>
        </section>
    )
}
