'use client'

import { useState, useEffect } from 'react'

export default function TopHeader() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Ustawienie docelowej daty na 2026-03-22 godzina 23:59:59
    const targetDate = new Date('2026-03-22T23:59:59')

    const timer = setInterval(() => {
      const now = new Date()
      const diff = targetDate.getTime() - now.getTime()

      if (diff <= 0) {
        clearInterval(timer)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText('WOMAN')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  const Digit = ({ value }: { value: string }) => (
    <span className="inline-flex items-center justify-center bg-white text-stone-900 font-bold rounded-sm w-[18px] h-[22px] sm:w-[22px] sm:h-[26px] text-[11px] sm:text-[13px] leading-none">
      {value}
    </span>
  )

  const Separator = () => (
    <span className="text-stone-400 font-bold mx-[1px] sm:mx-[2px]">:</span>
  )

  const days = pad(timeLeft.days)
  const hours = pad(timeLeft.hours)
  const minutes = pad(timeLeft.minutes)
  const seconds = pad(timeLeft.seconds)

  return (
    <div className="bg-stone-900 text-stone-200 text-center py-2 px-4">
      <div className="text-[12px] sm:text-[14px] tracking-widest uppercase">
        Świętujemy Dzień Kobiet! Odbierz <b>do -30% rabatu</b> na wszystko z kodem:{' '}
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 font-bold border border-stone-500 rounded px-1.5 py-0.5 hover:bg-stone-800 transition-colors cursor-pointer"
          title="Kliknij aby skopiować kod"
        >
          WOMAN
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-3 h-3 sm:w-3.5 sm:h-3.5"
          >
            {copied ? (
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            ) : (
              <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1zm0 4.5A1.5 1.5 0 005.5 9.5v7A1.5 1.5 0 007 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L11.94 8.44A1.5 1.5 0 0010.878 8H7z" />
            )}
          </svg>
          {copied && (
            <span className="text-[10px] sm:text-[11px] normal-case tracking-normal font-normal">
              skopiowano!
            </span>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-[3px] sm:gap-1 mt-1.5">
        {timeLeft.days > 0 && (
          <>
            <Digit value={days[0]} />
            <Digit value={days[1]} />
            <span className="text-stone-400 text-[10px] sm:text-[11px] mx-1">dni</span>
          </>
        )}
        <Digit value={hours[0]} />
        <Digit value={hours[1]} />
        <Separator />
        <Digit value={minutes[0]} />
        <Digit value={minutes[1]} />
        <Separator />
        <Digit value={seconds[0]} />
        <Digit value={seconds[1]} />
      </div>
    </div>
  )
}