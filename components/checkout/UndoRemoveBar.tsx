'use client'

import { useEffect } from 'react'
import { Undo2 } from 'lucide-react'
import { useCartStore } from '@/stores/cartZustand'

const UNDO_VISIBLE_MS = 8000

// „Usunięto produkt — Cofnij”. Znika sam po kilku sekundach.
export default function UndoRemoveBar() {
    const removedItem = useCartStore((state) => state.removedItem)
    const restoreRemovedItem = useCartStore((state) => state.restoreRemovedItem)
    const clearRemovedItem = useCartStore((state) => state.clearRemovedItem)

    useEffect(() => {
        if (!removedItem) return

        const timer = setTimeout(clearRemovedItem, UNDO_VISIBLE_MS)
        return () => clearTimeout(timer)
    }, [removedItem, clearRemovedItem])

    if (!removedItem) return null

    return (
        <div role="status" className="flex items-center justify-between gap-3 rounded-lg bg-[#f8f4f1] px-3 py-2 text-xs text-gray-700">
            <span className="truncate">Usunięto: {removedItem.name.split('CARINII--')[0]}</span>
            <button
                type="button"
                onClick={restoreRemovedItem}
                className="flex items-center gap-1 font-semibold text-[#441c49] underline flex-shrink-0"
            >
                <Undo2 className="w-3.5 h-3.5" /> Cofnij
            </button>
        </div>
    )
}
