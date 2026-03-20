"use client"

import { Suspense, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Search, ShoppingCart, Package, Loader2, X, Plus, Minus, Send, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useSearchParams } from "next/navigation"

interface Category {
    id: string
    name: string
    parent_id?: string
}

interface TypesenseProduct {
    name: string
    price: number
    ean: string
    cats: string[]
    cids: string[]
    color?: {
        name: string
        hex: string
        gradient_css: string
    }
    url: string
    stock?: number
}

interface CartItem {
    product: TypesenseProduct
    quantity: number
}

function StockIndicator({ stock }: { stock?: number }) {
    if (stock === undefined || stock === null) {
        return <span className="text-muted-foreground text-xs">-</span>
    }
    if (stock > 10) {
        return <span className="text-emerald-600 text-xs font-medium">Dostepny</span>
    }
    if (stock > 0) {
        return <span className="text-amber-600 text-xs font-medium">Malo ({stock})</span>
    }
    return <span className="text-red-500 text-xs font-medium">Brak</span>
}

function WholesalePageContent() {
    const searchParams = useSearchParams()
    const [products, setProducts] = useState<TypesenseProduct[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [categoriesLoading, setCategoriesLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [page, setPage] = useState(1)
    const [totalProducts, setTotalProducts] = useState(0)
    const [cart, setCart] = useState<CartItem[]>([])
    const [showCart, setShowCart] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [additionalNotes, setAdditionalNotes] = useState("")
    const [quantities, setQuantities] = useState<Record<string, number>>({})

    // Fetch categories via API route to avoid CORS
    useEffect(() => {
        const fetchCategories = async () => {
            setCategoriesLoading(true)
            try {
                const response = await fetch("/api/categories")
                const data = await response.json()
                setCategories(data || [])
            } catch (error) {
                console.error("Error fetching categories:", error)
            } finally {
                setCategoriesLoading(false)
            }
        }
        fetchCategories()
    }, [])

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        try {
            const query = searchQuery || "*"
            let url = `https://mebel-partner.pl/devback/typesense/api/collections/meble/documents/search?q=${encodeURIComponent(query)}&query_by=name,ean,cats&page=${page}&per_page=24`

            if (selectedCategory) {
                url += `&filter_by=cids:=[${selectedCategory}]`
            }

            const response = await fetch(url)
            const data = await response.json()

            setProducts(data.hits?.map((hit: any) => hit.document) || [])
            setTotalProducts(data.found || 0)
        } catch (error) {
            console.error("Error fetching products:", error)
        } finally {
            setLoading(false)
        }
    }, [page, searchQuery, selectedCategory])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    const getQuantity = (ean: string) => quantities[ean] || 1

    const setQuantity = (ean: string, value: number) => {
        setQuantities(prev => ({ ...prev, [ean]: Math.max(1, value) }))
    }

    const addToCart = (product: TypesenseProduct) => {
        const qty = getQuantity(product.ean)
        const existingItem = cart.find((item) => item.product.ean === product.ean)

        if (existingItem) {
            setCart(cart.map((item) =>
                item.product.ean === product.ean
                    ? { ...item, quantity: item.quantity + qty }
                    : item
            ))
        } else {
            setCart([...cart, { product, quantity: qty }])
        }
    }

    const updateCartQuantity = (ean: string, delta: number) => {
        setCart(
            cart.map((item) => (item.product.ean === ean ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)),
        )
    }

    const removeFromCart = (ean: string) => {
        setCart(cart.filter((item) => item.product.ean !== ean))
    }

    const handleSubmitInquiry = async () => {
        if (cart.length === 0) return

        setSubmitting(true)
        try {
            const inquiryData = {
                email: "user@example.com",
                name: "User",
                created_at: new Date().toISOString(),
                products: cart.map((item) => ({
                    ean: item.product.ean,
                    name: item.product.name,
                    quantity: item.quantity,
                    price: item.product.price,
                    url: item.product.url,
                })),
                total_items: cart.reduce((sum, item) => sum + item.quantity, 0),
                notes: additionalNotes,
                status: "pending",
            }

            const response = await fetch(
                "https://mebel-partner.pl/devback/typesense/api/collections/sales_inquiry/documents",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(inquiryData),
                },
            )

            if (response.ok) {
                alert("Zapytanie hurtowe zostalo wyslane! Skontaktujemy sie z Toba wkrotce.")
                setCart([])
                setAdditionalNotes("")
                setShowCart(false)
            } else {
                alert("Wystapil blad podczas wysylania zapytania. Sprobuj ponownie.")
            }
        } catch (error) {
            console.error("Error submitting inquiry:", error)
            alert("Wystapil blad podczas wysylania zapytania.")
        } finally {
            setSubmitting(false)
        }
    }

    const handleCategorySelect = (categoryId: string | null) => {
        setSelectedCategory(categoryId)
        setPage(1)
    }

    const totalPages = Math.ceil(totalProducts / 24)
    const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0)

    const topLevelCategories = categories.filter(cat => !cat.parent_id || cat.parent_id === "0")

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Zamowienia hurtowe</h1>
                <p className="text-muted-foreground">
                    Wybierz produkty i okresl ilosci. Skontaktujemy sie z Toba z oferta cenowa.
                </p>
            </div>

            {/* Search and Cart */}
            <div className="flex gap-4 mb-6 flex-col sm:flex-row">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        placeholder="Szukaj produktow..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setPage(1)
                        }}
                        className="pl-10"
                    />
                </div>
                <Button onClick={() => setShowCart(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white relative w-full sm:w-auto">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Koszyk ({cartItemsCount})
                    {cartItemsCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                            {cartItemsCount}
                        </span>
                    )}
                </Button>
            </div>

            {/* Category Filters */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filtruj po kategorii:</span>
                </div>
                {categoriesLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Ladowanie kategorii...</span>
                    </div>
                ) : (
                    <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex gap-2 pb-3">
                            <Badge
                                variant={selectedCategory === null ? "default" : "outline"}
                                className={`cursor-pointer shrink-0 ${selectedCategory === null ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "hover:bg-muted"}`}
                                onClick={() => handleCategorySelect(null)}
                            >
                                Wszystkie
                            </Badge>
                            {topLevelCategories.map((category) => (
                                <Badge
                                    key={category.id}
                                    variant={selectedCategory === category.id ? "default" : "outline"}
                                    className={`cursor-pointer shrink-0 ${selectedCategory === category.id ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "hover:bg-muted"}`}
                                    onClick={() => handleCategorySelect(category.id)}
                                >
                                    {category.name}
                                </Badge>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                )}
            </div>

            {/* Simple Table - 3 columns: Image | Details | Action */}
            <div className="border rounded-lg overflow-hidden mb-6">
                {/* Header Row - Hidden on mobile */}
                <div className="hidden md:grid md:grid-cols-[100px_1fr_180px] bg-muted/50 border-b">
                    <div className="p-3 font-medium text-sm">Zdjecie</div>
                    <div className="p-3 font-medium text-sm">Nazwa / EAN / Kolor / Ilosc / Cena</div>
                    <div className="p-3 font-medium text-sm text-center">Akcja</div>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    </div>
                )}

                {/* Empty state */}
                {!loading && products.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        Nie znaleziono produktow
                    </div>
                )}

                {/* Product Rows */}
                {!loading && products.map((product) => {
                    const cartItem = cart.find((item) => item.product.ean === product.ean)
                    const isInCart = !!cartItem
                    const currentQty = getQuantity(product.ean)

                    return (
                        <div key={product.ean} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                            {/* Desktop/Tablet Row */}
                            <div className="hidden md:grid md:grid-cols-[100px_1fr_180px] items-center">
                                {/* Image */}
                                <div className="p-3">
                                    <img
                                        src={`https://images.weserv.nl/?url=http://backend.mebel-partner.pl/devback/strapi_api/get_image_by_ean.php?ean=${product.ean}&w=80&h=80`}
                                        alt={product.name}
                                        className="w-16 h-16 object-cover rounded border"
                                    />
                                </div>

                                {/* Details Column */}
                                <div className="p-3">
                                    <div className="font-semibold text-sm leading-tight mb-2">{product.name}</div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                        {/* EAN */}
                                        <div className="flex items-center gap-1">
                                            <span className="text-muted-foreground">EAN:</span>
                                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{product.ean}</code>
                                        </div>

                                        {/* Color */}
                                        {product.color && (
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-muted-foreground">Kolor:</span>
                                                <div
                                                    className="w-4 h-4 rounded-full border border-gray-300"
                                                    style={{ background: product.color.gradient_css || product.color.hex }}
                                                />
                                                <span className="text-xs">{product.color.name}</span>
                                            </div>
                                        )}

                                        {/* Stock */}
                                        <div className="flex items-center gap-1">
                                            <span className="text-muted-foreground">Stan:</span>
                                            <StockIndicator stock={product.stock} />
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-center gap-1">
                                            <span className="text-muted-foreground">Cena:</span>
                                            <span className="font-bold text-emerald-600">{product.price?.toFixed(2)} zl</span>
                                        </div>

                                        {/* Quantity Input */}
                                        <div className="flex items-center gap-1">
                                            <span className="text-muted-foreground">Ilosc:</span>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setQuantity(product.ean, currentQty - 1)}
                                                    className="h-7 w-7 p-0"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </Button>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={currentQty}
                                                    onChange={(e) => setQuantity(product.ean, Number.parseInt(e.target.value) || 1)}
                                                    className="w-14 h-7 text-center text-sm"
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setQuantity(product.ean, currentQty + 1)}
                                                    className="h-7 w-7 p-0"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="p-3 flex flex-col gap-2">
                                    {isInCart ? (
                                        <>
                                            <div className="text-center text-xs text-emerald-600 font-medium">
                                                W koszyku: {cartItem.quantity} szt.
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => removeFromCart(product.ean)}
                                                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 bg-transparent"
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                Usun
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={() => addToCart(product)}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                        >
                                            <Plus className="w-4 h-4 mr-1" />
                                            Dodaj
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Mobile Card */}
                            <div className="md:hidden p-4">
                                <div className="flex gap-3">
                                    <img
                                        src={`https://images.weserv.nl/?url=http://backend.mebel-partner.pl/devback/strapi_api/get_image_by_ean.php?ean=${product.ean}&w=80&h=80`}
                                        alt={product.name}
                                        className="w-20 h-20 object-cover rounded border shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm leading-tight mb-2">{product.name}</h3>
                                        <div className="space-y-1 text-xs">
                                            <div><span className="text-muted-foreground">EAN:</span> {product.ean}</div>
                                            {product.color && (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-muted-foreground">Kolor:</span>
                                                    <div
                                                        className="w-3 h-3 rounded-full border border-gray-300"
                                                        style={{ background: product.color.gradient_css || product.color.hex }}
                                                    />
                                                    <span>{product.color.name}</span>
                                                </div>
                                            )}
                                            <div><span className="text-muted-foreground">Stan:</span> <StockIndicator stock={product.stock} /></div>
                                            <div className="text-base font-bold text-emerald-600">{product.price?.toFixed(2)} zl</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Actions */}
                                <div className="mt-3 flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setQuantity(product.ean, currentQty - 1)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </Button>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={currentQty}
                                            onChange={(e) => setQuantity(product.ean, Number.parseInt(e.target.value) || 1)}
                                            className="w-14 h-8 text-center"
                                        />
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setQuantity(product.ean, currentQty + 1)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex-1">
                                        {isInCart ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => removeFromCart(product.ean)}
                                                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 bg-transparent"
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                Usun ({cartItem.quantity})
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() => addToCart(product)}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Dodaj
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground px-4">
                        Strona {page} z {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Cart Dialog */}
            <Dialog open={showCart} onOpenChange={setShowCart}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5" />
                            Koszyk zapytania hurtowego
                        </DialogTitle>
                        <DialogDescription>
                            Przejrzyj wybrane produkty i wyslij zapytanie cenowe.
                        </DialogDescription>
                    </DialogHeader>

                    {cart.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Twoj koszyk jest pusty</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.product.ean} className="flex items-center gap-3 p-3 border rounded-lg">
                                    <img
                                        src={`https://images.weserv.nl/?url=http://backend.mebel-partner.pl/devback/strapi_api/get_image_by_ean.php?ean=${item.product.ean}&w=60&h=60`}
                                        alt={item.product.name}
                                        className="w-14 h-14 object-cover rounded border"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm truncate">{item.product.name}</div>
                                        <div className="text-xs text-muted-foreground">EAN: {item.product.ean}</div>
                                        <div className="text-sm font-bold text-emerald-600">{item.product.price?.toFixed(2)} zl</div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateCartQuantity(item.product.ean, -1)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </Button>
                                        <span className="w-10 text-center font-medium">{item.quantity}</span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateCartQuantity(item.product.ean, 1)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removeFromCart(item.product.ean)}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}

                            <div className="border-t pt-4">
                                <div className="flex justify-between mb-4">
                                    <span className="font-medium">Razem produktow:</span>
                                    <span className="font-bold">{cartItemsCount} szt.</span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <Label htmlFor="notes">Dodatkowe uwagi</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Dodatkowe informacje do zapytania..."
                                        value={additionalNotes}
                                        onChange={(e) => setAdditionalNotes(e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <Button
                                    onClick={handleSubmitInquiry}
                                    disabled={submitting}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Wysylanie...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Wyslij zapytanie hurtowe
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default function WholesalePage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        }>
            <WholesalePageContent />
        </Suspense>
    )
}
