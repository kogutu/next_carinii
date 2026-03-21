"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

/* ─────────────────────────────────────────────
   1.  LOGO SVG — Twoje logo jako komponent
   ───────────────────────────────────────────── */
const Logo = ({ className = "", style = {} }) => (
    <svg
        viewBox="0 0 133.9 126.9"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={style}
        fill="currentColor"
    >
        <polygon points="32.1,-0.1 1,-0.1 1,100.5 57.3,50.3" />
        <polygon points="132.9,25.4 79.2,76.4 105.8,126.9 132.9,126.9" />
        <polygon points="50.4,75.4 132.9,16.8 132.9,-0.1 41.8,-0.1 85.8,49.4 1,108.5 1,126.9 97.6,126.9 60.7,85.6" />
    </svg>
);

/* ─────────────────────────────────────────────
   2.  PAGE TRANSITION LOADER
   ───────────────────────────────────────────── */
export default function PageTransitionLoader() {
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [phase, setPhase] = useState("idle"); // idle | fade-in | active | fade-out

    /* Detect route changes */
    useEffect(() => {
        setPhase("fade-in");
        setIsVisible(true);
        setIsLoading(true);

        const fadeInTimer = setTimeout(() => {
            setPhase("active");
        }, 400);

        const minimumDisplay = setTimeout(() => {
            setPhase("fade-out");

            const fadeOutTimer = setTimeout(() => {
                setIsVisible(false);
                setIsLoading(false);
                setPhase("idle");
            }, 500);

            return () => clearTimeout(fadeOutTimer);
        }, 1200);

        return () => {
            clearTimeout(fadeInTimer);
            clearTimeout(minimumDisplay);
        };
    }, [pathname]);

    /* ── Intercept <a> clicks for early trigger ── */
    useEffect(() => {
        const handleClick = (e) => {
            const anchor = e.target.closest("a[href]");
            if (!anchor) return;
            const href = anchor.getAttribute("href");
            if (!href || href.startsWith("http") || href.startsWith("#") || href === pathname) return;

            setPhase("fade-in");
            setIsVisible(true);
            setIsLoading(true);

            setTimeout(() => setPhase("active"), 400);
        };

        document.addEventListener("click", handleClick, true);
        return () => document.removeEventListener("click", handleClick, true);
    }, [pathname]);

    if (!isVisible) return null;

    return (
        <>
            {/* ── Fullscreen overlay ── */}
            <div
                className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto"
                style={{
                    backgroundColor: "#09090b",
                    opacity: phase === "fade-in" ? 1 : phase === "active" ? 1 : 0,
                    transition: phase === "fade-in" ? "opacity 0.35s ease-out" : "opacity 0.45s ease-in",
                }}
            >
                <div className="relative flex flex-col items-center gap-10">

                    {/* ── Ambient glow ── */}
                    <div
                        className="absolute w-64 h-64 rounded-full opacity-[0.03]"
                        style={{
                            background: "radial-gradient(circle, white 0%, transparent 65%)",
                            animation: "loaderBreathe 3s ease-in-out infinite",
                        }}
                    />

                    {/* ── Spinning orbit ring ── */}
                    <div className="relative flex items-center justify-center">
                        <svg
                            className="absolute w-32 h-32"
                            viewBox="0 0 100 100"
                            style={{ animation: "loaderSpin 3s linear infinite" }}
                        >
                            <defs>
                                <linearGradient id="loaderArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                                    <stop offset="40%" stopColor="rgba(255,255,255,0.18)" />
                                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                                </linearGradient>
                            </defs>
                            <circle
                                cx="50"
                                cy="50"
                                r="46"
                                fill="none"
                                stroke="url(#loaderArcGradient)"
                                strokeWidth="0.8"
                                strokeLinecap="round"
                                strokeDasharray="50 239"
                            />
                        </svg>

                        {/* ── Second orbit — counter-rotation ── */}
                        <svg
                            className="absolute w-[8.5rem] h-[8.5rem]"
                            viewBox="0 0 100 100"
                            style={{ animation: "loaderSpin 5s linear infinite reverse" }}
                        >
                            <circle
                                cx="50"
                                cy="50"
                                r="46"
                                fill="none"
                                stroke="url(#loaderArcGradient)"
                                strokeWidth="0.5"
                                strokeLinecap="round"
                                strokeDasharray="30 259"
                            />
                        </svg>

                        {/* ── Logo center ── */}
                        <Logo
                            className="w-12 h-12 text-white/90 relative z-10"
                            style={{ animation: "loaderBreathe 2.6s ease-in-out infinite" }}
                        />
                    </div>

                    {/* ── Progress bar — thin elegant line ── */}
                    <div className="w-24 h-px bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white/20 rounded-full"
                            style={{
                                animation: "loaderProgress 1.2s ease-in-out infinite",
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* ── Keyframes ── */}
            <style jsx global>{`
        @keyframes loaderBreathe {
          0%, 100% { opacity: 0.55; transform: scale(0.97); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes loaderSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes loaderProgress {
          0% { width: 0%; margin-left: 0; }
          50% { width: 100%; margin-left: 0; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
        </>
    );
}