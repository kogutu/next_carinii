'use client'

import { useState } from 'react'
import Link from 'next/link'
import FormInput from '@/components/checkout/FormInput'
import PayButton from '@/components/payments/PayButton'
import { useWishlistStore } from '@/stores/wishlistStore'

type WishlistEmailFormProps = {
    submitLabel: string
}

// Jedyny „login” ulubionych: adres e-mail. Używany w oknie po kliknięciu serduszka i na pustej stronie /ulubione.
export default function WishlistEmailForm({ submitLabel }: WishlistEmailFormProps) {
    const submitEmail = useWishlistStore((state) => state.submitEmail)
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setError('')
        setIsLoading(true)

        const result = await submitEmail(email)
        setIsLoading(false)
        if (!result.ok) setError(result.message)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormInput
                name="wishlist-email"
                label="Adres e-mail"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(value) => {
                    setEmail(value)
                    setError('')
                }}
                error={error}
            />

            <PayButton type="submit" align="center" isLoading={isLoading} loadingLabel="Zapisuję…" disabled={!email.trim()} className="h-12 text-base">
                {submitLabel}
            </PayButton>

            <p className="text-pretty text-xs text-muted-foreground">
                Adres e-mail posłuży do zapisania i przywrócenia Twojej listy ulubionych na każdym urządzeniu. Szczegóły w{' '}
                <Link href="/polityka-prywatnosci" className="underline underline-offset-4">polityce prywatności</Link>.
            </p>
        </form>
    )
}
