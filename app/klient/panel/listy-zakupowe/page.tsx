"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Heart, Plus, Trash2, Edit2, ShoppingCart, Loader2, Package, Search } from "lucide-react"
import Image from "next/image"
import { useCartStore } from "@/stores/cartZustand"

interface Product {
    id: string
    ean: string
    img: { url: string; alt: string }
    name: string
    price?: number
}

interface ShoppingList {
    id: string
    name: string
    items: Product[]
    createdAt?: string
}

export default function ShoppingListsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const addToCart = useCartStore(state => state.addItemToCart)

    const [lists, setLists] = useState<ShoppingList[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [newListName, setNewListName] = useState("")
    const [editListName, setEditListName] = useState("")
    const [selectedList, setSelectedList] = useState<ShoppingList | null>(null)
    const [actionLoading, setActionLoading] = useState(false)
    const [selectedListForAdd, setSelectedListForAdd] = useState<ShoppingList | null>(null)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/")
        }
    }, [status, router])

    useEffect(() => {
        if (status === "authenticated") {
            loadLists()
        }
    }, [status])

    const loadLists = async () => {
        const email = session?.user?.email
        if (!email) return

        setLoading(true)
        try {
            const response = await fetch(`/api/shopping-lists?includeItems=true&email=${encodeURIComponent(email)}`)
            if (response.ok) {
                const data = await response.json()
                setLists(data)
            }
        } catch (error) {
            console.error("Error loading lists:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateList = async () => {
        if (!newListName.trim()) return

        setActionLoading(true)
        try {
            const response = await fetch("/api/shopping-lists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newListName,
                    email: session?.user?.email,
                }),
            })

            if (response.ok) {
                await loadLists()
                setNewListName("")
                setShowCreateDialog(false)
            }
        } catch (error) {
            console.error("Error creating list:", error)
        } finally {
            setActionLoading(false)
        }
    }

    const handleEditList = async () => {
        if (!selectedList || !editListName.trim()) return

        setActionLoading(true)
        try {
            const response = await fetch(`/api/shopping-lists/${selectedList.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editListName }),
            })

            if (response.ok) {
                await loadLists()
                setShowEditDialog(false)
                setSelectedList(null)
                setEditListName("")
            }
        } catch (error) {
            console.error("Error editing list:", error)
        } finally {
            setActionLoading(false)
        }
    }

    const handleDeleteList = async () => {
        if (!selectedList) return

        setActionLoading(true)
        try {
            const response = await fetch(`/api/shopping-lists/${selectedList.id}`, {
                method: "DELETE",
            })

            if (response.ok) {
                await loadLists()
                setShowDeleteDialog(false)
                setSelectedList(null)
            }
        } catch (error) {
            console.error("Error deleting list:", error)
        } finally {
            setActionLoading(false)
        }
    }

    const handleRemoveFromList = async (listId: string, productId: string) => {
        try {
            const response = await fetch(`/api/shopping-lists/${listId}/items/${productId}`, {
                method: "DELETE",
            })

            if (response.ok) {
                await loadLists()
            }
        } catch (error) {
            console.error("Error removing item:", error)
        }
    }

    const handleAddToCart = (item: Product) => {
        // addToCart({
        //     id: item.id,
        //     name: item.name,
        //     price: item.price || 0,
        //     image: item.img?.url || "/placeholder.svg",
        // })
    }

    const handleAddAllToCart = (list: ShoppingList) => {
        list.items.forEach((item) => handleAddToCart(item))
    }

    const totalItems = lists.reduce((sum, list) => sum + list.items.length, 0)

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-mpgray" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Moje listy zakupowe</h1>
                    <p className="text-gray-600 mt-1">Zarządzaj swoimi listami zakupowymi ({totalItems} produktów)</p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)} className="gap-2 bg-hert hover:bg-hert/90">
                    <Plus className="h-4 w-4" />
                    Nowa lista
                </Button>
            </div>

            {/* Lists Grid */}
            {lists.length === 0 ? (
                <Card className="p-12">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Heart className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak list zakupowych</h3>
                        <p className="text-gray-600 mb-6 max-w-md">
                            Utwórz swoją pierwszą listę zakupową aby łatwo zarządzać produktami, które chcesz kupić.
                        </p>
                        <Button onClick={() => setShowCreateDialog(true)} className="gap-2 bg-hert hover:bg-hert/90">
                            <Plus className="h-4 w-4" />
                            Utwórz pierwszą listę
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {lists.map((list) => (
                        <Card key={list.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            {/* List Header */}
                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 text-lg">{list.name}</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {list.items.length} {list.items.length === 1 ? "produkt" : "produktów"}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedList(list)
                                                setEditListName(list.name)
                                                setShowEditDialog(true)
                                            }}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedList(list)
                                                setShowDeleteDialog(true)
                                            }}
                                            className="h-8 w-8 p-0 text-mpred hover:text-mpred hover:bg-mpred/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => {
                                        window.dispatchEvent(new CustomEvent('openSearch', {
                                            detail: { showLiked: true }
                                        }))
                                        // document.getElementById("search")?.focus()
                                        // document.getElementById("search")?.click()

                                        setSelectedListForAdd(list)
                                    }}
                                    size="sm"
                                    variant="outline"
                                    className="w-full gap-2 mb-2 border-mpgray text-mpgray hover:bg-hgold/10"
                                >
                                    <Search className="h-4 w-4" />
                                    Dodaj produkty
                                </Button>
                                {list.items.length > 0 && (
                                    <Button
                                        onClick={() => handleAddAllToCart(list)}
                                        size="sm"
                                        className="w-full gap-2 bg-hert hover:bg-hert/90"
                                    >
                                        <ShoppingCart className="h-4 w-4" />
                                        Dodaj wszystko do koszyka
                                    </Button>
                                )}
                            </div>

                            {/* Products List */}
                            <div className="p-4">
                                {list.items.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Lista jest pusta</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                        {list.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                                            >
                                                <div className="relative w-16 h-16 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                                                    <Image
                                                        src={
                                                            item.img?.url ||
                                                            `https://images.weserv.nl/?url=http://backend.mebel-partner.pl/devback/strapi_api/get_image_by_ean.php?ean=${item.ean || "/placeholder.svg"}&w=145&h=145`
                                                        }
                                                        alt={item.img?.alt || item.name}
                                                        fill
                                                        className="object-contain p-1"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</h4>
                                                    {item.price && (
                                                        <p className="text-sm font-bold text-mpred mt-1">{item.price.toFixed(2)} zł</p>
                                                    )}
                                                    <div className="flex gap-2 mt-2">
                                                        <Button
                                                            onClick={() => handleAddToCart(item)}
                                                            size="sm"
                                                            className="text-xs h-7 bg-hert hover:bg-hert/90"
                                                        >
                                                            Do koszyka
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleRemoveFromList(list.id, item.id)}
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs h-7 border-mpred text-mpred hover:bg-mpred/10"
                                                        >
                                                            Usuń
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create List Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Utwórz nową listę zakupową</DialogTitle>
                        <DialogDescription>Podaj nazwę dla swojej nowej listy zakupowej.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input
                            placeholder="Nazwa listy..."
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleCreateList()
                            }}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={actionLoading}>
                            Anuluj
                        </Button>
                        <Button
                            onClick={handleCreateList}
                            disabled={!newListName.trim() || actionLoading}
                            className="bg-hert hover:bg-hert/90"
                        >
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Utwórz listę
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit List Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edytuj listę zakupową</DialogTitle>
                        <DialogDescription>Zmień nazwę listy zakupowej.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input
                            placeholder="Nazwa listy..."
                            value={editListName}
                            onChange={(e) => setEditListName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleEditList()
                            }}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={actionLoading}>
                            Anuluj
                        </Button>
                        <Button
                            onClick={handleEditList}
                            disabled={!editListName.trim() || actionLoading}
                            className="bg-hert hover:bg-hert/90"
                        >
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Zapisz zmiany
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete List Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Czy na pewno usunąć listę?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Lista "{selectedList?.name}" zostanie trwale usunięta wraz ze wszystkimi produktami (
                            {selectedList?.items.length || 0}). Tej operacji nie można cofnąć.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>Anuluj</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteList}
                            disabled={actionLoading}
                            className="bg-mpred hover:bg-mpred/90"
                        >
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Usuń listę
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    )
}
