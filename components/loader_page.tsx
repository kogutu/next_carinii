"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// LoadingIndicator.jsx
import React from 'react';

const LoadingIndicator = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
            <div className="relative flex flex-col items-center justify-center gap-6 p-8">
                {/* Główny kontener z animacją rotacji dla logo */}
                <div className="relative animate-spin-slow">
                    <div className="bg-white/80 backdrop-blur-sm rounded-full p-5 shadow-xl logo-drop-shadow">
                        <svg
                            version="1.1"
                            id="Warstwa_1"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            x="0px"
                            y="0px"
                            viewBox="0 0 133.9 126.9"
                            className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
                        >
                            <g fill="currentColor" className="text-indigo-600">
                                <polygon points="32.1,-0.1 1,-0.1 1,100.5 57.3,50.3" />
                                <polygon points="132.9,25.4 79.2,76.4 105.8,126.9 132.9,126.9" />
                                <polygon points="50.4,75.4 132.9,16.8 132.9,-0.1 41.8,-0.1 85.8,49.4 1,108.5 1,126.9 97.6,126.9 60.7,85.6" />
                            </g>
                        </svg>
                    </div>
                    {/* Dekoracyjne kropki wokół */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-indigo-400 rounded-full animate-ping opacity-75"></div>
                    <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                </div>

                {/* Tekst ładowania z delikatną animacją */}
                <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-1 items-center">
                        <span className="text-gray-700 font-medium text-lg tracking-wide">
                            Ładowanie
                        </span>
                        <span className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                        </span>
                    </div>
                    <div className="h-1 w-32 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full animate-pulse-gentle"></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">proszę czekać...</p>
                </div>
            </div>

            <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes pulse-gentle {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(0.98);
          }
        }
        .animate-pulse-gentle {
          animation: pulse-gentle 1.4s ease-in-out infinite;
        }
        .logo-drop-shadow {
          filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1));
        }
      `}</style>
        </div>
    );
};


export default function RouteListener() {
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);

    // pathname się zmienił → strona dotarła, wyłącz loader
    useEffect(() => {
        setLoading(false);
    }, [pathname]);

    // przechwytuj kliknięcia w linki → włącz loader
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const anchor = (e.target as HTMLElement).closest("a");
            if (!anchor) return;

            const href = anchor.getAttribute("href");
            if (
                !href ||
                href.startsWith("#") ||
                href.startsWith("http") ||
                anchor.target === "_blank"
            ) return;

            if (href !== pathname) {
                setLoading(true);
            }
        };

        document.addEventListener("click", handleClick, true);
        return () => document.removeEventListener("click", handleClick, true);
    }, [pathname]);

    if (!loading) return null;

    return (<div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-4 shadow-lg  items-center gap-3">

            <svg version="1.1" id="Warstwa_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                viewBox="0 0 133.9 126.9" className="animate-pulse">
                <g>
                    <polygon points="32.1,-0.1 1,-0.1 1,100.5 57.3,50.3 	" />
                    <polygon points="132.9,25.4 79.2,76.4 105.8,126.9 132.9,126.9 	" />
                    <polygon points="50.4,75.4 132.9,16.8 132.9,-0.1 41.8,-0.1 85.8,49.4 1,108.5 1,126.9 97.6,126.9 60.7,85.6 	" />
                </g>

            </svg>
            <span>Ładowanie...</span>
        </div>
    </div>
    );
}