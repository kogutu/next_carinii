"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  Loader2,
  Eye,
  RotateCcw,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  Home,
  Minus,
  Plus,
  RefreshCw,
  PackagePlus,
  PackageX,
  Coins,
  Upload,
  Trash2,
  MessageCircle,
  Send,
  User,
  Headphones,
  Filter,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

// ─── Interfejsy dopasowane do API get-orders.php (Magento 1.9) ───

interface OrderItem {
  item_id: number
  product_id: number
  sku: string
  name: string
  qty_ordered: number
  qty_shipped: number
  qty_refunded: number
  price: number
  price_incl_tax: number
  row_total: number
  row_total_incl_tax: number
  discount_amount: number
  tax_amount: number
  image_url: string
  product_options: any | null
}

interface OrderAddress {
  firstName: string
  lastName: string
  street: string
  city: string
  postal: string
  country: string
  phone: string | null
  company?: string | null
  vat_id?: string | null
}

interface OrderPayment {
  method: string
  method_title: string
}

interface OrderShipment {
  shipment_id: string
  created_at: string
  tracks: Array<{
    carrier: string
    title: string
    number: string
  }>
}

interface OrderStatusHistory {
  status: string
  comment: string | null
  created_at: string
}

interface MagentoOrder {
  order_id: number
  increment_id: string
  status: string
  status_label: string
  state: string
  created_at: string
  updated_at: string
  currency: string
  subtotal: number
  subtotal_incl_tax: number
  shipping_amount: number
  shipping_incl_tax: number
  shipping_description: string
  discount_amount: number
  tax_amount: number
  grand_total: number
  total_qty_ordered: number
  coupon_code: string | null
  payment: OrderPayment | null
  billing_address: OrderAddress | null
  shipping_address: OrderAddress | null
  items: OrderItem[]
  shipments: OrderShipment[]
  status_history: OrderStatusHistory[]
  // Wzbogacone dane z hesk
  hesk?: {
    id: string
    posts: ChatMessage[]
  }
  messageCount?: number
  hasUnreadFromBOK?: boolean
}

interface ChatMessage {
  id: string
  name: string
  message: string
  dt: string
  isStaff: boolean
}

type ActionType = "return" | "complaint" | null

const RETURN_REASONS = [
  "Produkt nie spełnia moich wymagań",
  "Otrzymałem produkt uszkodzony",
  "Otrzymałem niekompletny produkt",
  "Niezadowalająca jakość",
  "Kolor mebla różni się od zamówionego",
  "Nie chcę podawać przyczyny",
]

const COMPLAINT_TYPES = [
  {
    value: "wymiana_elementu",
    label: "Wymiana elementu",
    description: "Wymień uszkodzony, zepsuty element na nowy",
    icon: RefreshCw,
  },
  {
    value: "brakujacy_element",
    label: "Doręczenie brakującego elementu",
    description: "Gdy brakuje jakiegoś elementu postaramy Ci się go niezwłocznie dostarczyć",
    icon: PackagePlus,
  },
  {
    value: "wymiana_produktu",
    label: "Wymiana produktu",
    description: "Odbierzmy obecny produkt i wymienimy produkt na nowy",
    icon: PackageX,
  },
  {
    value: "rekompensata",
    label: "Rekompensata finansowa",
    description: "Otrzymaj finansową rekompensatę za poniesione problemy",
    icon: Coins,
  },
]

interface SelectedProduct {
  id: number
  qty: number
  reason: string
  files?: File[]
  upFiles?: string[]
  loadUpFile?: boolean
  uploadStatus?: string
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<MagentoOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<MagentoOrder | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [actionType, setActionType] = useState<ActionType>(null)
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [expandedOrders, setExpandedOrders] = useState<number[]>([])
  const [actionStep, setActionStep] = useState<"select" | "details" | "shipping" | "summary" | "complaintType">(
    "select",
  )
  const [bankAccount, setBankAccount] = useState("")
  const [shippingMethod, setShippingMethod] = useState<"self" | "personal">("self")

  const [complaintType, setComplaintType] = useState<string>("")
  const [complaintDescription, setComplaintDescription] = useState<{ [key: number]: string }>({})

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showChatTab, setShowChatTab] = useState(false)

  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [showOnlyWithMessages, setShowOnlyWithMessages] = useState(false)

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchOrders(session.user.id, session.user.email ?? "")
    }
  }, [status, session])

  const fetchMessages = async (email: string, orderIncrementIds: string[]) => {
    if (orderIncrementIds.length === 0) return {}

    try {
      const nidsParam = orderIncrementIds.join(";")
      const response = await fetch(
        `https://sklep.carinii.com.pl/directseo/nextjs/user/getHesk.php?nids=${nidsParam}&email=${encodeURIComponent(email)}`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch messages")
      }

      const heskData = await response.json()
      const messagesByOrder: { [key: string]: any[] } = {}

      if (Array.isArray(heskData)) {
        heskData.forEach((orderMessages: any[]) => {
          if (Array.isArray(orderMessages) && orderMessages.length > 0) {
            const mainTicket = orderMessages.find((msg: any) => msg.trackid)
            if (mainTicket && mainTicket.subject) {
              const orderNid = mainTicket.subject
              messagesByOrder[orderNid] = orderMessages.map((msg: any) => ({
                ...msg,
                isStaff: msg.staffid !== "0" && msg.staffid !== null && msg.staffid !== undefined,
              }))
            }
          }
        })
      }

      return messagesByOrder
    } catch (error) {
      console.error("Error fetching messages:", error)
      return {}
    }
  }

  const fetchOrders = async (uid: string, email: string) => {
    try {
      setIsLoading(true)

      const response = await fetch(
        `https://sklep.carinii.com.pl/directseo/nextjs/user/getUserOrders.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid, page: 1, limit: 100 }),
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || "API error")
      }

      const ordersData: MagentoOrder[] = result.data?.orders || []

      // Pobierz wiadomości hesk po increment_id zamówień
      const orderIncrementIds = ordersData.map((order) => order.increment_id)
      const messagesByOrder = await fetchMessages(email, orderIncrementIds)

      // Wzbogać zamówienia o dane wiadomości
      const enrichedOrders = ordersData.map((order) => {
        const orderMessages = messagesByOrder[order.increment_id]
        if (orderMessages && orderMessages.length > 0) {
          const lastMessage = orderMessages[orderMessages.length - 1]
          return {
            ...order,
            hesk: {
              id: orderMessages.find((m: any) => m.trackid)?.id || "",
              posts: orderMessages,
            },
            messageCount: orderMessages.length,
            hasUnreadFromBOK: lastMessage.isStaff === true,
          }
        }
        return {
          ...order,
          messageCount: 0,
          hasUnreadFromBOK: false,
        }
      })

      setOrders(enrichedOrders)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Filtrowanie zamówień ───

  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (statusFilter !== "all") {
      const orderStatus = order.status_label.toLowerCase()
      if (statusFilter === "delivered" && order.state !== "complete") return false
      if (statusFilter === "shipped" && order.state !== "processing") return false
      if (statusFilter === "pending" && order.state !== "pending" && order.state !== "new") return false
    }

    // Date filter
    if (dateFilter !== "all") {
      const orderDate = new Date(order.created_at)
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))

      if (dateFilter === "7days" && daysDiff > 7) return false
      if (dateFilter === "30days" && daysDiff > 30) return false
      if (dateFilter === "90days" && daysDiff > 90) return false
    }

    // Messages filter
    if (showOnlyWithMessages && (!order.messageCount || order.messageCount === 0)) return false

    return true
  })

  const activeOrders = filteredOrders.filter(
    (order) => order.state !== "canceled",
  )
  const cancelledOrders = filteredOrders.filter(
    (order) => order.state === "canceled",
  )

  // ─── Auth guards ───

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

  // ─── Helpery statusów ───

  const getStatusColor = (statusLabel: string) => {
    const s = statusLabel.toLowerCase()
    if (s.includes("complete") || s.includes("dostarczone") || s.includes("zrealizowane"))
      return "bg-green-100 text-green-800"
    if (s.includes("processing") || s.includes("wysłane") || s.includes("w drodze"))
      return "bg-blue-100 text-blue-800"
    if (s.includes("canceled") || s.includes("anulowane"))
      return "bg-red-100 text-red-800"
    if (s.includes("pending") || s.includes("oczekujące") || s.includes("new"))
      return "bg-yellow-100 text-yellow-800"
    return "bg-gray-100 text-gray-800"
  }

  const getStatusIcon = (statusLabel: string) => {
    const s = statusLabel.toLowerCase()
    if (s.includes("complete") || s.includes("dostarczone")) return <CheckCircle className="h-4 w-4" />
    if (s.includes("processing") || s.includes("wysłane")) return <Truck className="h-4 w-4" />
    if (s.includes("canceled") || s.includes("anulowane")) return <X className="h-4 w-4" />
    return <Package className="h-4 w-4" />
  }

  const getProductImageUrl = (item: OrderItem) => {
    if (item.image_url) return item.image_url
    return `/placeholder.svg`
  }

  // ─── Akcje ───

  const handleViewDetails = (order: MagentoOrder) => {
    setSelectedOrder(order)
    setIsDetailsOpen(true)
    setActionType(null)
    setSelectedProducts([])
    setActionStep("select")
    setBankAccount("")
    setShippingMethod("self")
    setComplaintType("")
    setComplaintDescription({})
    setChatMessages(order.hesk?.posts || [])
    setShowChatTab(false)
    setNewMessage("")
  }

  const handleSendMessage = async () => {
    if (!selectedOrder || !newMessage.trim()) return

    setIsSendingMessage(true)

    try {
      const shippingAddr = selectedOrder.shipping_address
      const name = shippingAddr
        ? `${shippingAddr.firstName} ${shippingAddr.lastName}`
        : session?.user?.name || "Klient"
      const email = shippingAddr?.phone ? shippingAddr.phone : ""
      const userEmail = session?.user?.email || ""

      const cid = actionType === "complaint" ? 1 : 2
      const payload = {
        hid: selectedOrder.hesk?.id || "",
        name: name,
        nid: selectedOrder.increment_id,
        message: newMessage,
        custom1: shippingAddr?.phone || "",
        email: userEmail,
        email2: userEmail,
        priority: "low",
        subject: selectedOrder.increment_id,
        mysecnum: "82276",
        token: "9c0c3eca41cb81e5ee5c01062f137b119b7e265f",
        category: cid,
        hx: "3",
        hy: "",
      }

      const endpoint = selectedOrder.hesk?.id
        ? "https://bok.mebel-partner.pl/addReplyNid.php"
        : "https://bok.mebel-partner.pl/submit_ticket.php?submit=1&json=true"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()

      if (data.post) {
        setChatMessages(data.post)
      }

      setNewMessage("")
      setShowSuccessMessage(true)
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 2500)

      if (session?.user?.id && session?.user?.email) {
        fetchOrders(session.user.id, session.user.email)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie.")
    } finally {
      setIsSendingMessage(false)
    }
  }

  const handleAction = (type: ActionType) => {
    setActionType(type)
    setSelectedProducts([])
    setComplaintType("")
    setComplaintDescription({})
    setActionStep(type === "complaint" ? "complaintType" : "select")
  }

  const toggleProductSelection = (itemId: number) => {
    setSelectedProducts((prev) => {
      const existing = prev.find((p) => p.id === itemId)
      if (existing) {
        return prev.filter((p) => p.id !== itemId)
      } else {
        return [...prev, { id: itemId, qty: 1, reason: "" }]
      }
    })
  }

  const updateProductQty = (itemId: number, delta: number, maxQty: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) => {
        if (p.id === itemId) {
          const newQty = Math.max(1, Math.min(maxQty, p.qty + delta))
          return { ...p, qty: newQty }
        }
        return p
      }),
    )
  }

  const updateProductReason = (itemId: number, reason: string) => {
    setSelectedProducts((prev) => prev.map((p) => (p.id === itemId ? { ...p, reason } : p)))
  }

  const updateProductDescription = (itemId: number, description: string) => {
    setComplaintDescription((prev) => ({ ...prev, [itemId]: description }))
  }

  const isProductSelected = (itemId: number) => {
    return selectedProducts.some((p) => p.id === itemId)
  }

  const getSelectedProduct = (itemId: number) => {
    return selectedProducts.find((p) => p.id === itemId)
  }

  const handleFileUpload = async (productId: number, files: FileList) => {
    if (!files || files.length === 0) return

    const filesArray = Array.from(files)

    setSelectedProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return { ...p, files: [...(p.files || []), ...filesArray], loadUpFile: true }
        }
        return p
      }),
    )

    const formData = new FormData()
    filesArray.forEach((file) => {
      formData.append("files[]", file)
    })

    try {
      const response = await fetch("/klient/data/files?upload=true", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      setSelectedProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            return {
              ...p,
              upFiles: [...(p.upFiles || []), ...(data || [])],
              loadUpFile: false,
              uploadStatus: "",
            }
          }
          return p
        }),
      )
    } catch (error) {
      console.error("File upload error:", error)
      setSelectedProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            return {
              ...p,
              loadUpFile: false,
              uploadStatus: "Wystąpił błąd, spróbuj jeszcze raz",
            }
          }
          return p
        }),
      )
    }
  }

  const handleRemoveFile = (productId: number, fileIndex: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newFiles = [...(p.files || [])]
          newFiles.splice(fileIndex, 1)
          return { ...p, files: newFiles }
        }
        return p
      }),
    )
  }

  const formatBankAccount = (value: string) => {
    const digits = value.replace(/\D/g, "")
    const limited = digits.slice(0, 26)
    const formatted = limited.match(/.{1,4}/g)?.join(" ") || limited
    return formatted
  }

  const handleBankAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBankAccount(e.target.value)
    setBankAccount(formatted)
  }

  const getUnformattedBankAccount = () => {
    return bankAccount.replace(/\s/g, "")
  }

  const canProceedToNextStep = () => {
    if (actionStep === "complaintType") {
      return complaintType !== ""
    }
    if (actionStep === "select") {
      if (actionType === "complaint") {
        return (
          selectedProducts.length > 0 &&
          selectedProducts.every((p) => {
            const desc = complaintDescription[p.id]
            const hasFiles = (p.upFiles && p.upFiles.length > 0) || (p.files && p.files.length > 0)

            if (complaintType === "wymiana_elementu" || complaintType === "brakujacy_element") {
              return desc && desc.trim() !== "" && hasFiles
            }
            return desc && desc.trim() !== ""
          })
        )
      }
      return selectedProducts.length > 0 && selectedProducts.every((p) => p.reason.trim() !== "")
    }
    if (actionStep === "details") {
      const unformatted = getUnformattedBankAccount()
      return unformatted.length === 26 && /^\d+$/.test(unformatted)
    }
    if (actionStep === "shipping") {
      return true
    }
    return false
  }

  const handleNextStep = () => {
    if (actionStep === "complaintType") setActionStep("select")
    else if (actionStep === "select") {
      if (actionType === "return") {
        setActionStep("details")
      } else {
        setActionStep("summary")
      }
    } else if (actionStep === "details") setActionStep("shipping")
    else if (actionStep === "shipping") setActionStep("summary")
  }

  const handlePrevStep = () => {
    if (actionStep === "summary") {
      if (actionType === "return") {
        setActionStep("shipping")
      } else {
        setActionStep("select")
      }
    } else if (actionStep === "shipping") setActionStep("details")
    else if (actionStep === "details") setActionStep("select")
    else if (actionStep === "select" && actionType === "complaint") setActionStep("complaintType")
  }

  const handleSubmitAction = async () => {
    if (!selectedOrder) {
      console.error("Invalid order data")
      return
    }

    setIsSubmitting(true)

    try {
      const productsToSubmit = selectedProducts.map((selected, index) => {
        const item = selectedOrder.items.find((p) => p.item_id === selected.id)
        if (!item) return null

        const payload = {
          przyczyna: actionType === "complaint" ? complaintDescription[selected.id] : selected.reason,
          qty: item.qty_ordered,
          refunded_qty: selected.qty,
          refund_amount: String(selected.qty * item.price),
          max_refunded: selected.qty,
          files: selected.upFiles || [],
          product_order: selected.id,
          nid: selectedOrder.increment_id,
          id_zr: `${actionType === "complaint" ? "RK" : "ZW"}-${selectedOrder.increment_id}_${index}`,
          status: 1,
          order: selectedOrder.order_id,
          type: actionType === "complaint" ? "reklamacja" : "zwrot",
          action: actionType === "complaint" ? complaintType : shippingMethod,
          bank_account: actionType === "return" ? getUnformattedBankAccount() : "",
          address: selectedOrder.shipping_address,
        }

        return payload
      })

      const validProducts = productsToSubmit.filter((p) => p !== null)

      for (let i = 0; i < validProducts.length; i++) {
        const response = await fetch("https://www.hert.pl/klient/data/index?saveZwrotReklamacja=true", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validProducts[i]),
        })

        if (!response.ok) {
          throw new Error(`Failed to submit product ${i + 1}`)
        }
      }

      alert(`Dziękujemy! Twoje zgłoszenie zostało przyjęte`)

      setIsDetailsOpen(false)
      setActionType(null)

      if (session?.user?.id && session?.user?.email) {
        fetchOrders(session.user.id, session.user.email)
      }
    } catch (error) {
      console.error("Submission error:", error)
      alert("Wystąpił błąd podczas wysyłania zgłoszenia. Spróbuj ponownie.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTotalReturnAmount = () => {
    if (!selectedOrder) return 0
    return selectedProducts.reduce((total, selected) => {
      const item = selectedOrder.items.find((p) => p.item_id === selected.id)
      return total + (item ? item.price * selected.qty : 0)
    }, 0)
  }

  const toggleOrderExpand = (orderId: number) => {
    setExpandedOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]))
  }

  // ─── Render ───

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Moje zamówienia</h1>
          <p className="text-muted-foreground">Przeglądaj historię swoich zamówień</p>
        </div>
      </div>

      {/* Filtry */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtruj zamówienia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Status zamówienia</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="delivered">Dostarczone</SelectItem>
                  <SelectItem value="shipped">Wysłane</SelectItem>
                  <SelectItem value="pending">Oczekujące</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data zamówienia</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Cały czas</SelectItem>
                  <SelectItem value="7days">Ostatnie 7 dni</SelectItem>
                  <SelectItem value="30days">Ostatnie 30 dni</SelectItem>
                  <SelectItem value="90days">Ostatnie 90 dni</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant={showOnlyWithMessages ? "default" : "outline"}
                className={showOnlyWithMessages ? "bg-hert hover:bg-hert/90" : ""}
                onClick={() => setShowOnlyWithMessages(!showOnlyWithMessages)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Pokaż z wiadomościami
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {activeOrders.length === 0 && cancelledOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Brak zamówień</h3>
                <p className="text-muted-foreground">Nie masz jeszcze żadnych zamówień</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Aktywne zamówienia */}
              {activeOrders.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Aktywne zamówienia</h2>
                  {activeOrders.map((order) => {
                    const isExpanded = expandedOrders.includes(order.order_id)
                    return (
                      <Card key={order.order_id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <CardTitle className="text-lg">Zamówienie #{order.increment_id}</CardTitle>
                                <Badge className={getStatusColor(order.status_label)}>
                                  {getStatusIcon(order.status_label)}
                                  <span className="ml-1">{order.status_label}</span>
                                </Badge>
                                {order.messageCount && order.messageCount > 0 && (
                                  <Badge className="bg-hert text-white hover:bg-hert/90 shadow-md">
                                    <MessageCircle className="h-3 w-3 mr-1" />
                                    {order.messageCount}
                                    {order.hasUnreadFromBOK && <span className="ml-1">🔥</span>}
                                  </Badge>
                                )}
                              </div>
                              <CardDescription>
                                Data zamówienia: {new Date(order.created_at).toLocaleDateString("pl-PL")}
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">{order.grand_total.toFixed(2)} zł</div>
                              <div className="text-sm text-muted-foreground">{order.total_qty_ordered} produktów</div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div className="flex gap-2 flex-wrap">
                            <Button variant="outline" onClick={() => handleViewDetails(order)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Szczegóły
                            </Button>
                            <Button variant="outline" onClick={() => toggleOrderExpand(order.order_id)}>
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-4 w-4 mr-2" />
                                  Zwiń produkty
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-2" />
                                  Pokaż produkty
                                </>
                              )}
                            </Button>
                          </div>

                          {isExpanded && (
                            <div className="border-t pt-4 space-y-3">
                              {order.items.map((item) => (
                                <div key={item.item_id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                                  <Image
                                    src={getProductImageUrl(item) || "/placeholder.svg"}
                                    alt={item.name}
                                    width={60}
                                    height={60}
                                    className="rounded object-cover"
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                                    <p className="text-sm">
                                      Ilość: {item.qty_ordered} | {item.price.toFixed(2)} zł
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              {/* Anulowane zamówienia */}
              {cancelledOrders.length > 0 && (
                <div className="space-y-4 mt-8">
                  <h2 className="text-xl font-semibold text-muted-foreground">Anulowane zamówienia</h2>
                  {cancelledOrders.map((order) => (
                    <Card key={order.order_id} className="opacity-75">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-lg">Zamówienie #{order.increment_id}</CardTitle>
                              <Badge className={getStatusColor(order.status_label)}>
                                {getStatusIcon(order.status_label)}
                                <span className="ml-1">{order.status_label}</span>
                              </Badge>
                            </div>
                            <CardDescription>
                              Data zamówienia: {new Date(order.created_at).toLocaleDateString("pl-PL")}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold">{order.grand_total.toFixed(2)} zł</div>
                            <div className="text-sm text-muted-foreground">{order.total_qty_ordered} produktów</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(order)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Szczegóły
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ─── Dialog szczegółów zamówienia ─── */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          {selectedOrder && (
            <div className="p-6 space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl">Zamówienie #{selectedOrder.increment_id}</DialogTitle>
                <DialogDescription>
                  Data: {new Date(selectedOrder.created_at).toLocaleDateString("pl-PL")}
                </DialogDescription>
              </DialogHeader>

              {!actionType && (
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Szczegóły zamówienia</TabsTrigger>
                    <TabsTrigger value="chat">
                      Informacje / Pomoc
                      {selectedOrder.messageCount && selectedOrder.messageCount > 0 && (
                        <Badge className="ml-2 bg-hert text-white">
                          {selectedOrder.messageCount}
                          {selectedOrder.hasUnreadFromBOK && <span className="ml-1">🔥</span>}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-6 mt-6">
                    {/* Status */}
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Status zamówienia
                      </h3>
                      <Badge className={`${getStatusColor(selectedOrder.status_label)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(selectedOrder.status_label)}
                        {selectedOrder.status_label}
                      </Badge>
                    </div>

                    {/* Tracking */}
                    {selectedOrder.shipments && selectedOrder.shipments.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Listy przewozowe
                        </h3>
                        <div className="space-y-2">
                          {selectedOrder.shipments.map((shipment, sIdx) =>
                            shipment.tracks.map((track, tIdx) => (
                              <div key={`${sIdx}-${tIdx}`} className="flex items-center gap-2 p-2 bg-muted rounded">
                                <Truck className="h-4 w-4" />
                                <span className="text-sm font-medium">{track.title}:</span>
                                <code className="text-sm font-mono">{track.number}</code>
                              </div>
                            )),
                          )}
                        </div>
                      </div>
                    )}

                    {/* Produkty */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Produkty
                      </h3>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {selectedOrder.items.map((item) => (
                          <div key={item.item_id} className="flex items-start gap-4 p-4 border rounded-lg">
                            <Image
                              src={getProductImageUrl(item) || "/placeholder.svg"}
                              alt={item.name}
                              width={80}
                              height={80}
                              className="rounded object-cover"
                            />
                            <div className="flex-1 space-y-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                              <p className="text-sm">
                                Ilość: <span className="font-medium">{item.qty_ordered}</span>
                              </p>
                              <p className="font-semibold">{item.price.toFixed(2)} zł</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Adresy */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {selectedOrder.shipping_address && (
                        <div>
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Home className="h-5 w-5" />
                            Adres wysyłki
                          </h3>
                          <div className="text-sm space-y-1 bg-muted p-3 rounded">
                            <p className="font-medium">
                              {selectedOrder.shipping_address.firstName} {selectedOrder.shipping_address.lastName}
                            </p>
                            <p>{selectedOrder.shipping_address.street}</p>
                            <p>
                              {selectedOrder.shipping_address.postal} {selectedOrder.shipping_address.city}
                            </p>
                            {selectedOrder.shipping_address.phone && (
                              <p className="text-muted-foreground pt-2">{selectedOrder.shipping_address.phone}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedOrder.billing_address && (
                        <div>
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Adres rozliczeniowy
                          </h3>
                          <div className="text-sm space-y-1 bg-muted p-3 rounded">
                            {selectedOrder.billing_address.company && (
                              <p className="font-medium">{selectedOrder.billing_address.company}</p>
                            )}
                            <p className="font-medium">
                              {selectedOrder.billing_address.firstName} {selectedOrder.billing_address.lastName}
                            </p>
                            <p>{selectedOrder.billing_address.street}</p>
                            <p>
                              {selectedOrder.billing_address.postal} {selectedOrder.billing_address.city}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Podsumowanie kwot */}
                    <div className="border-t pt-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Produkty:</span>
                          <span className="font-medium">{selectedOrder.subtotal.toFixed(2)} zł</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Wysyłka ({selectedOrder.shipping_description}):</span>
                          <span className="font-medium">{selectedOrder.shipping_amount.toFixed(2)} zł</span>
                        </div>
                        {selectedOrder.discount_amount !== 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Rabat{selectedOrder.coupon_code ? ` (${selectedOrder.coupon_code})` : ""}:</span>
                            <span className="font-medium">{selectedOrder.discount_amount.toFixed(2)} zł</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Podatek:</span>
                          <span className="font-medium">{selectedOrder.tax_amount.toFixed(2)} zł</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                          <span>Razem:</span>
                          <span>{selectedOrder.grand_total.toFixed(2)} zł</span>
                        </div>
                        {selectedOrder.payment && (
                          <div className="flex justify-between text-muted-foreground">
                            <span>Metoda płatności:</span>
                            <span>{selectedOrder.payment.method_title}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Przyciski akcji */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => handleAction("return")}
                        variant="outline"
                        className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Zgłoś zwrot
                      </Button>
                      <Button
                        onClick={() => handleAction("complaint")}
                        variant="outline"
                        className="flex-1 border-orange-500 text-orange-600 hover:bg-orange-50"
                      >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Zgłoś reklamację
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Tab czatu */}
                  <TabsContent value="chat" className="space-y-4 mt-6">
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto p-4 bg-muted/30 rounded-lg">
                      {chatMessages.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Brak wiadomości</p>
                          <p className="text-sm">Zadaj pytanie dotyczące tego zamówienia</p>
                        </div>
                      ) : (
                        chatMessages.map((msg, index) => (
                          <div key={index} className={`flex gap-3 ${msg.isStaff ? "flex-row" : "flex-row-reverse"}`}>
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.isStaff ? "bg-hgold text-white" : "bg-hert text-white"}`}
                            >
                              {msg.isStaff ? <Headphones className="h-4 w-4" /> : <User className="h-4 w-4" />}
                            </div>
                            <div
                              className={`flex-1 ${msg.isStaff ? "bg-white" : "bg-hert/10"} rounded-lg p-3 shadow-sm`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-sm">{msg.name}</span>
                                <span className="text-xs text-muted-foreground">{msg.dt}</span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {showSuccessMessage && (
                      <div className="bg-teal-100 border-l-4 border-teal-500 text-teal-900 p-4 rounded">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 text-teal-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-lg">Wiadomość wysłana</p>
                            <p className="text-sm">
                              Twoja wiadomość została poprawnie wysłana, postaramy się odpowiedzieć jak najszybciej
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <Label htmlFor="chat-message">Wpisz swoją wiadomość</Label>
                      <Textarea
                        id="chat-message"
                        rows={5}
                        placeholder="Wpisz swoją odpowiedź..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={isSendingMessage}
                        className="resize-none"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={isSendingMessage || !newMessage.trim()}
                        className="bg-hert hover:bg-hert/90 text-white w-full"
                      >
                        {isSendingMessage ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Wysyłanie...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Wyślij wiadomość
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}

          {/* ─── Formularze zwrot/reklamacja ─── */}
          {actionType && selectedOrder && (
            <div className="p-6 space-y-6">
              {actionStep === "complaintType" && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">Wybierz preferowany sposób reklamacji</h3>
                  </div>

                  <div className="space-y-3">
                    {COMPLAINT_TYPES.map((type) => {
                      const Icon = type.icon
                      return (
                        <button
                          key={type.value}
                          onClick={() => setComplaintType(type.value)}
                          className={`w-full text-left p-4 border-2 rounded-lg transition-all hover:border-mpgray ${complaintType === type.value ? "border-mpgray bg-gray-50" : "border-gray-200"}`}
                        >
                          <div className="flex items-start gap-3">
                            <Icon className="h-6 w-6 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-base mb-1">{type.label}</h4>
                              <p className="text-sm text-muted-foreground">{type.description}</p>
                            </div>
                            {complaintType === type.value && (
                              <CheckCircle className="h-5 w-5 text-mpgray flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setActionType(null)} className="bg-hgold text-white">
                      <X className="mr-2 h-4 w-4" />
                      Wstecz
                    </Button>
                    <Button onClick={handleNextStep} disabled={!canProceedToNextStep()} className="flex-1 bg-hert">
                      Dalej
                    </Button>
                  </div>
                </div>
              )}

              {/* Wybór produktów */}
              {actionStep === "select" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg mb-4">
                      {actionType === "return" ? "Wybierz produkty do zwrotu" : "Wybierz produkty do reklamacji"}
                    </h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {selectedOrder.items.map((item) => {
                        const selected = getSelectedProduct(item.item_id)
                        const isSelected = isProductSelected(item.item_id)

                        return (
                          <div
                            key={item.item_id}
                            className={`border rounded-lg p-4 ${isSelected ? "border-mpgreen bg-hert/5" : "border-gray-200"}`}
                          >
                            <div className="flex items-start gap-4">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleProductSelection(item.item_id)}
                                id={`product-${item.item_id}`}
                              />
                              <Image
                                src={getProductImageUrl(item) || "/placeholder.svg"}
                                alt={item.name}
                                width={80}
                                height={80}
                                className="rounded object-cover"
                              />
                              <div className="flex-1 space-y-2">
                                <Label
                                  htmlFor={`product-${item.item_id}`}
                                  className="text-base font-medium cursor-pointer"
                                >
                                  {item.name}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Ilość sztuk: {item.qty_ordered} | 1 szt. {item.price.toFixed(2)} zł
                                </p>

                                {isSelected && (
                                  <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-2">
                                      <Label className="text-sm">Ile sztuk chcesz zwrócić:</Label>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => updateProductQty(item.item_id, -1, item.qty_ordered)}
                                          disabled={!selected || selected.qty <= 1}
                                        >
                                          <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-8 text-center font-medium">{selected?.qty || 1}</span>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => updateProductQty(item.item_id, 1, item.qty_ordered)}
                                          disabled={!selected || selected.qty >= item.qty_ordered}
                                        >
                                          <Plus className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>

                                    {actionType === "return" ? (
                                      <div className="space-y-1">
                                        <Label className="text-sm">Wybierz przyczynę zwrotu:</Label>
                                        <Select
                                          value={selected?.reason || ""}
                                          onValueChange={(value) => updateProductReason(item.item_id, value)}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Wybierz przyczynę" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {RETURN_REASONS.map((reason) => (
                                              <SelectItem key={reason} value={reason}>
                                                {reason}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <Label className="text-sm">Opisz problem z produktem:</Label>
                                        <Textarea
                                          value={complaintDescription[item.item_id] || ""}
                                          onChange={(e) => updateProductDescription(item.item_id, e.target.value)}
                                          placeholder="Opisz dlaczego reklamujesz dany produkt, jeśli posiadasz zdjęcia dołącz je poniżej."
                                          className="min-h-[100px]"
                                        />
                                        {(!complaintDescription[item.item_id] ||
                                          complaintDescription[item.item_id].trim() === "") && (
                                            <p className="text-sm text-red-500">Uzupełnij pole problemu.</p>
                                          )}
                                        <div className="space-y-2">
                                          <Label className="text-sm">Dodaj zdjęcia:</Label>
                                          <div className="flex items-center gap-2">
                                            <Input
                                              type="file"
                                              accept="image/*"
                                              multiple
                                              onChange={(e) =>
                                                e.target.files && handleFileUpload(item.item_id, e.target.files)
                                              }
                                              className="flex-1"
                                            />
                                            <Upload className="h-4 w-4 text-muted-foreground" />
                                          </div>
                                          {selected?.loadUpFile && (
                                            <div className="flex items-center gap-2 text-sm text-blue-600">
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                              Przesyłanie...
                                            </div>
                                          )}
                                          {selected?.uploadStatus && (
                                            <p className="text-sm text-red-500">{selected.uploadStatus}</p>
                                          )}
                                          {selected?.files && selected.files.length > 0 && (
                                            <div className="space-y-1">
                                              {selected.files.map((file, idx) => (
                                                <div
                                                  key={idx}
                                                  className="flex items-center justify-between text-sm bg-muted p-2 rounded"
                                                >
                                                  <span className="truncate">{file.name}</span>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveFile(item.item_id, idx)}
                                                  >
                                                    <Trash2 className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={handlePrevStep} className="flex-1 bg-transparent">
                      <X className="mr-2 h-4 w-4" />
                      Wstecz
                    </Button>
                    <Button
                      onClick={handleNextStep}
                      disabled={!canProceedToNextStep()}
                      className="flex-1 bg-hert hover:bg-hert/90"
                    >
                      Dalej
                      <ChevronDown className="ml-2 h-4 w-4 rotate-[-90deg]" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Krok: nr konta bankowego (tylko zwroty) */}
              {actionType === "return" && actionStep === "details" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-mpred">Podaj dane do zwrotu należności</h3>
                    <Label htmlFor="bankAccount" className="text-base mb-2 block">
                      Nr konta bankowego do przelewu:
                    </Label>
                    <Input
                      id="bankAccount"
                      type="text"
                      placeholder="XX XXXX XXXX XXXX XXXX XXXX XXXX"
                      value={bankAccount}
                      onChange={handleBankAccountChange}
                      className="text-lg"
                    />
                    {bankAccount && getUnformattedBankAccount().length < 26 && (
                      <p className="text-sm text-red-500 mt-1">
                        Wprowadź poprawny nr konta (26 znaków) - pozostało {26 - getUnformattedBankAccount().length}{" "}
                        cyfr
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={handlePrevStep} className="flex-1 bg-hgold text-white">
                      <X className="mr-2 h-4 w-4" />
                      Wstecz
                    </Button>
                    <Button
                      onClick={handleNextStep}
                      disabled={!canProceedToNextStep()}
                      className="flex-1 bg-hert text-white hover:bg-hert/90"
                    >
                      Dalej
                      <ChevronDown className="ml-2 h-4 w-4 rotate-[-90deg]" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Krok: sposób wysyłki (tylko zwroty) */}
              {actionStep === "shipping" && actionType === "return" && (
                <div className="space-y-4">
                  <div className="bg-mpred/10 border border-mpred/20 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">Wybierz sposób zwrotu</h3>
                  </div>

                  <RadioGroup
                    value={shippingMethod}
                    onValueChange={(value: "self" | "personal") => setShippingMethod(value)}
                  >
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-md ${shippingMethod === "self" ? "ring-2 ring-mpgreen" : ""}`}
                    >
                      <CardContent className="flex items-start gap-4 p-6" onClick={() => setShippingMethod("self")}>
                        <div className="bg-gray-100 p-3 rounded-full">
                          <Home className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <RadioGroupItem value="self" id="self" />
                            <Label htmlFor="self" className="font-semibold cursor-pointer">
                              Wyślę samodzielnie na własny koszt
                            </Label>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Zobowiązuję się do samodzielnego nadania paczki wraz z poniesieniem wszystkich kosztów
                            związanych z dostarczeniem zwrotu do sklepu.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className={`cursor-pointer transition-all hover:shadow-md ${shippingMethod === "personal" ? "ring-2 ring-mpgreen" : ""}`}
                    >
                      <CardContent
                        className="flex items-start gap-4 p-6"
                        onClick={() => setShippingMethod("personal")}
                      >
                        <div className="bg-gray-100 p-3 rounded-full">
                          <Truck className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <RadioGroupItem value="personal" id="personal" />
                            <Label htmlFor="personal" className="font-semibold cursor-pointer">
                              Dostarczę osobiście do siedziby firmy
                            </Label>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Zobowiązuję się do dostarczenia paczki do siedziby firmy MEBEL-PARTNER.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </RadioGroup>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={handlePrevStep} className="bg-hgold text-white">
                      <X className="mr-2 h-4 w-4" />
                      Wstecz
                    </Button>
                    <Button onClick={handleNextStep} className="bg-hert text-white hover:bg-hert/90">
                      Dalej
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Podsumowanie */}
              {actionStep === "summary" && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    {actionType === "complaint" ? "Podsumowanie reklamacji" : "Podsumowanie zwrotu"}
                  </h3>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Wybrane produkty do {actionType === "complaint" ? "reklamacji" : "zwrotu"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedProducts.map((selected) => {
                        const item = selectedOrder.items.find((p) => p.item_id === selected.id)
                        if (!item) return null

                        return (
                          <div key={selected.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                            <Image
                              src={getProductImageUrl(item) || "/placeholder.svg"}
                              alt={item.name}
                              width={60}
                              height={60}
                              className="rounded object-cover"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {actionType === "complaint" ? "Opis problemu" : "Powód"}:{" "}
                                {actionType === "complaint" ? complaintDescription[selected.id] : selected.reason}
                              </p>
                              <p className="text-sm">
                                Ilość: {selected.qty} | {item.price.toFixed(2)} zł
                              </p>
                              {selected.files && selected.files.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  <Upload className="inline h-3 w-3 mr-1" />
                                  Załączono {selected.files.length}{" "}
                                  {selected.files.length === 1 ? "plik" : "pliki"}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-mpgreen">
                                {(item.price * selected.qty).toFixed(2)} zł
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>

                  {actionType === "complaint" ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Informacje o reklamacji</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div>
                          <p className="font-medium">Preferowany sposób reklamacji:</p>
                          <p className="text-muted-foreground">
                            {COMPLAINT_TYPES.find((t) => t.value === complaintType)?.label}
                          </p>
                        </div>
                        {selectedOrder.shipping_address && (
                          <div>
                            <p className="font-medium">Adres odbioru/wysyłki:</p>
                            <p className="text-muted-foreground">
                              {selectedOrder.shipping_address.firstName} {selectedOrder.shipping_address.lastName}
                            </p>
                            <p className="text-muted-foreground">{selectedOrder.shipping_address.street}</p>
                            <p className="text-muted-foreground">
                              {selectedOrder.shipping_address.postal} {selectedOrder.shipping_address.city}
                            </p>
                            {selectedOrder.shipping_address.phone && (
                              <p className="text-muted-foreground mt-1">
                                tel. {selectedOrder.shipping_address.phone}
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Sposób zwrotu</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">
                            {shippingMethod === "self"
                              ? "Wyślę samodzielnie na własny koszt"
                              : "Dostarczę osobiście do siedziby firmy"}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-mpgreen">
                        <CardHeader>
                          <CardTitle className="text-base">Kwota do zwrotu</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Produktów do zwrotu:</span>
                              <span>{selectedProducts.reduce((sum, p) => sum + p.qty, 0)} szt</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-mpgreen">
                              <span>Kwota zwrotu:</span>
                              <span>{getTotalReturnAmount().toFixed(2)} zł</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Numer konta: {bankAccount}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={handlePrevStep} className="bg-hgold text-white">
                      <X className="mr-2 h-4 w-4" />
                      Wstecz
                    </Button>
                    <Button
                      onClick={handleSubmitAction}
                      disabled={isSubmitting}
                      className="bg-mpred text-white hover:bg-mpred/90"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Wysyłam zgłoszenie...
                        </>
                      ) : (
                        <>
                          Wyślij {actionType === "complaint" ? "reklamację" : "zwrot"}
                          <CheckCircle className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}