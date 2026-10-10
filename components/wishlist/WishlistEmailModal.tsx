'use client'

import { Heart } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useWishlistStore } from '@/stores/wishlistStore'
import WishlistEmailForm from './WishlistEmailForm'

// Okno po kliknięciu serduszka bez zapamiętanego adresu: „podaj e-mail, aby zapisać ulubione”.
export default function WishlistEmailModal() {
    const isOpen = useWishlistStore((state) => state.isEmailModalOpen)
    const hasProduct = useWishlistStore((state) => Boolean(state.pendingProduct))
    const close = useWishlistStore((state) => state.closeEmailModal)

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
            <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader className="items-center text-center sm:text-center">
                    <span className="mb-2 flex size-12 items-center justify-center rounded-full bg-muted" aria-hidden="true">
                        <Heart className="size-6 fill-hcar text-hcar" strokeWidth={1.5} />
                    </span>
                    <DialogTitle className="text-balance text-xl font-semibold tracking-tight">Zapisz do ulubionych</DialogTitle>
                    <DialogDescription className="text-pretty">
                        Podaj adres e-mail, aby zapisać produkt na swojej spersonalizowanej liście ulubionych. Ten sam adres otworzy ją
                        na każdym urządzeniu.
                    </DialogDescription>
                </DialogHeader>

                <WishlistEmailForm submitLabel={hasProduct ? 'Zapisz do ulubionych' : 'Pokaż moją listę'} />
            </DialogContent>
        </Dialog>
    )
}
