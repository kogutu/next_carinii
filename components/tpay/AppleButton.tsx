'use client'

import { createElement, useEffect, useRef } from 'react'

type AppleButtonProps = {
    onPress: () => void
    // „pay” = Zapłać z Apple Pay, „buy” = Kup z Apple Pay
    type: 'pay' | 'buy'
}

// Oficjalny element <apple-pay-button> z SDK Apple. Zdarzenie podpinamy ręcznie: React nie mapuje onClick
// na zwykłe „click” dla elementów niestandardowych, więc `onClick` by tu nie zadziałał.
export default function AppleButton({ onPress, type }: AppleButtonProps) {
    const ref = useRef<HTMLElement>(null)
    const latest = useRef(onPress)
    latest.current = onPress

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const handleClick = () => latest.current()
        element.addEventListener('click', handleClick)
        return () => element.removeEventListener('click', handleClick)
    }, [])

    return createElement('apple-pay-button', {
        ref,
        buttonstyle: 'black',
        type,
        locale: 'pl-PL',
        // element Apple nie używa zwykłego width — rozmiar i zaokrąglenie ustawiamy jego zmiennymi CSS
        style: {
            display: 'block',
            width: '100%',
            '--apple-pay-button-width': '100%',
            '--apple-pay-button-height': '44px',
            '--apple-pay-button-border-radius': '12px',
        },
    })
}
