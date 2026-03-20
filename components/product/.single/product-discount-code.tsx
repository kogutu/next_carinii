"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Tag } from "lucide-react"

interface ProductDiscountCodeProps {
    code: string
    discountPercent: number
    discountAmount: number
    priceWithCode: number
    validUntil: string
    currentPrice: number
}

export function ProductDiscountCode({
    code,
    discountPercent,
    discountAmount,
    priceWithCode,
    validUntil,
    currentPrice,
}: ProductDiscountCodeProps) {
    const [copied, setCopied] = useState(false)

    const formatPrice = (value: number) => {
        return new Intl.NumberFormat("pl-PL", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value)
    }

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy code:", err)
        }
    }

    return (
        <div className="border-2 border-orange-400 rounded-lg p-4 bg-gradient-to-r from-orange-50 to-yellow-50">
            {/* Header with code name and badge */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-orange-600" />
                    <span className="font-bold text-lg text-orange-900">SANTA </span>
                </div>
                <Badge variant="secondary" className="bg-orange-200 text-orange-900 hover:bg-orange-300">
                    Zastosuj kod
                </Badge>
            </div>



            {/* Copy code button */}
            <Button
                onClick={handleCopyCode}
                className="w-full mb-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                size="lg"
            >
                {copied ? (
                    <>
                        <Check className="h-4 w-4 mr-2" />
                        Skopiowano kod!
                    </>
                ) : (
                    <>
                        <Copy className="h-4 w-4 mr-2" />
                        Zastosuj kod: {code}
                    </>
                )}
            </Button>

            {/* Terms and conditions */}

        </div>
    )
}
