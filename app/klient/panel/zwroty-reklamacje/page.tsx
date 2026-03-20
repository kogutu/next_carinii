"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { RotateCcw, AlertCircle, Loader2, Plus, Package, MapPin, CreditCard, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface ProductReturnComplaint {
  id: number
  przyczyna: string
  qty: number
  refunded_qty: number
  total: number | null
  refund_amount: string
  bank_account: string
  type: "zwrot" | "reklamacja"
  action: "self" | "company"
  id_zr: string
  files: string[]
  address: {
    firstname: string
    lastname: string
    street: string
    postcode: string
    city: string
    telephone: string
    email: string
  }
}

interface ProductOrder {
  id: number
  name: string
  ean: string
  qty: number
  price: number
  nid: string
  createdAt: string
  products_return_complaint: {
    data: ProductReturnComplaint | null
  }
}

export default function ReturnsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [returns, setReturns] = useState<ProductOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewReturnDialog, setShowNewReturnDialog] = useState(false)
  const [selectedReturn, setSelectedReturn] = useState<ProductOrder | null>(null)

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetchReturns()
    }
  }, [status, session])

  const fetchReturns = async () => {
    try {
      setIsLoading(true)
      const email = session?.user?.email
      const response = await fetch(
        `http://backend.mebel-partner.pl:4210/api/products-orders?populate=deep,3&filters[shipping_address][email][$eq]=${email}&filters[$or][0][status][id]=23&filters[$or][1][status][id]=20`,
      )
      const data = await response.json()

      // Filter only products that have return_complaint data
      const returnsWithData = data.data.filter(
        (product: ProductOrder) => product.products_return_complaint?.data !== null,
      )

      setReturns(returnsWithData)
    } catch (error) {
      console.error("Error fetching returns:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/")
    return null
  }

  const getTypeBadge = (type: "zwrot" | "reklamacja") => {
    if (type === "zwrot") {
      return <Badge className="bg-blue-100 text-blue-800">Zwrot</Badge>
    }
    return <Badge className="bg-purple-100 text-purple-800">Reklamacja</Badge>
  }

  const getActionText = (action: "self" | "company") => {
    return action === "self" ? "Wysyłka samodzielna" : "Odbiór osobisty"
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <RotateCcw className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Zwroty i reklamacje</h1>
        </div>
        <Button onClick={() => setShowNewReturnDialog(true)} className="bg-hert hover:bg-hert/90 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Nowy zwrot
        </Button>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-blue-900">Masz 14 dni na zwrot produktu</p>
              <p className="text-sm text-blue-700">
                Zgodnie z prawem konsumenckim, możesz zwrócić produkt bez podania przyczyny w ciągu 14 dni od otrzymania
                przesyłki.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : returns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <RotateCcw className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Brak zwrotów</h2>
            <p className="text-muted-foreground text-center mb-4">Nie masz jeszcze żadnych zwrotów ani reklamacji</p>
            <Button onClick={() => setShowNewReturnDialog(true)} className="bg-hert hover:bg-hert/90 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Zgłoś zwrot/reklamację
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {returns.map((returnItem) => {
            const returnData = returnItem.products_return_complaint.data
            if (!returnData) return null

            return (
              <Card key={returnItem.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{returnData.id_zr}</CardTitle>
                        {getTypeBadge(returnData.type)}
                      </div>
                      <CardDescription>
                        Zamówienie {returnItem.nid} • {new Date(returnItem.createdAt).toLocaleDateString("pl-PL")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Product info */}
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      <Image
                        src={`https://images.weserv.nl/?url=http://backend.mebel-partner.pl/devback/strapi_api/get_image_by_ean.php?ean=${returnItem.ean}&w=90&h=90`}
                        alt={returnItem.name}
                        width={80}
                        height={80}
                        className="rounded object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{returnItem.name}</h4>
                        <p className="text-sm text-muted-foreground">Ilość: {returnData.qty}</p>
                        <p className="text-sm text-muted-foreground">EAN: {returnItem.ean}</p>
                      </div>
                    </div>

                    {/* Return details grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Przyczyna:</p>
                        <p className="text-sm font-medium">{returnData.przyczyna}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Sposób zwrotu:</p>
                        <p className="text-sm font-medium">{getActionText(returnData.action)}</p>
                      </div>
                      {returnData.type === "zwrot" && returnData.refund_amount && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Kwota zwrotu:</p>
                          <p className="text-sm font-medium">{returnData.refund_amount} zł</p>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      className="w-full md:w-auto bg-transparent"
                      onClick={() => setSelectedReturn(returnItem)}
                    >
                      Zobacz szczegóły
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={showNewReturnDialog} onOpenChange={setShowNewReturnDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Jak zgłosić zwrot lub reklamację?
            </DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p>
                Zwrotów i reklamacji dokonuje się bezpośrednio z zakładki{" "}
                <span className="font-semibold">Moje zamówienia</span>.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium text-blue-900">Instrukcja:</p>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Przejdź do zakładki Moje zamówienia</li>
                  <li>Znajdź zamówienie z produktem do zwrotu</li>
                  <li>Kliknij "Szczegóły zamówienia"</li>
                  <li>Wybierz "Zgłoś zwrot" lub "Zgłoś reklamację"</li>
                </ol>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setShowNewReturnDialog(false)}
                >
                  Zamknij
                </Button>
                <Button
                  className="flex-1 bg-hert hover:bg-hert/90 text-white"
                  onClick={() => {
                    setShowNewReturnDialog(false)
                    router.push("/klient/panel/zamowienia")
                  }}
                >
                  Przejdź do zamówień
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedReturn !== null} onOpenChange={() => setSelectedReturn(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedReturn && selectedReturn.products_return_complaint.data && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Szczegóły {selectedReturn.products_return_complaint.data.type === "zwrot" ? "zwrotu" : "reklamacji"}
                </DialogTitle>
                <DialogDescription>{selectedReturn.products_return_complaint.data.id_zr}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Product details */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Produkt
                  </h3>
                  <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <Image
                      src={`https://images.weserv.nl/?url=http://backend.mebel-partner.pl/devback/strapi_api/get_image_by_ean.php?ean=${selectedReturn.ean}&w=100&h=100`}
                      alt={selectedReturn.name}
                      width={100}
                      height={100}
                      className="rounded object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">{selectedReturn.name}</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">SKU:</span>{" "}
                          <span className="font-medium">{selectedReturn.ean}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Ilość:</span>{" "}
                          <span className="font-medium">{selectedReturn.products_return_complaint.data.qty}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cena:</span>{" "}
                          <span className="font-medium">{selectedReturn.price} zł</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Return reason */}
                <div>
                  <h3 className="font-semibold mb-2">Przyczyna:</h3>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">
                    {selectedReturn.products_return_complaint.data.przyczyna}
                  </p>
                </div>

                {/* Address */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Adres {selectedReturn.products_return_complaint.data.action === "self" ? "wysyłki" : "odbioru"}
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                    <p className="font-medium">
                      {selectedReturn.products_return_complaint.data.address.firstname}{" "}
                      {selectedReturn.products_return_complaint.data.address.lastname}
                    </p>
                    <p>{selectedReturn.products_return_complaint.data.address.street}</p>
                    <p>
                      {selectedReturn.products_return_complaint.data.address.postcode}{" "}
                      {selectedReturn.products_return_complaint.data.address.city}
                    </p>
                    <p className="text-muted-foreground">
                      Tel: {selectedReturn.products_return_complaint.data.address.telephone}
                    </p>
                  </div>
                </div>

                {/* Bank account for returns */}
                {selectedReturn.products_return_complaint.data.type === "zwrot" &&
                  selectedReturn.products_return_complaint.data.bank_account && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Numer konta do zwrotu
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-mono text-sm">
                          {selectedReturn.products_return_complaint.data.bank_account}
                        </p>
                      </div>
                    </div>
                  )}

                {/* Refund amount */}
                {selectedReturn.products_return_complaint.data.type === "zwrot" &&
                  selectedReturn.products_return_complaint.data.refund_amount && (
                    <div>
                      <h3 className="font-semibold mb-2">Kwota do zwrotu:</h3>
                      <p className="text-2xl font-bold text-mpgreen">
                        {selectedReturn.products_return_complaint.data.refund_amount} zł
                      </p>
                    </div>
                  )}

                {/* Photos if available */}
                {selectedReturn.products_return_complaint.data.files &&
                  selectedReturn.products_return_complaint.data.files.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Załączone zdjęcia:</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedReturn.products_return_complaint.data.files.map((file, index) => (
                          <Image
                            key={index}
                            src={file || "/placeholder.svg"}
                            alt={`Zdjęcie ${index + 1}`}
                            width={150}
                            height={150}
                            className="rounded object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
