"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, Lock, MapPin, Save, Loader2, Edit, Building2, FileText, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatNIP, formatPostcode, formatPhone } from '@/hooks/useMaskedInput'

interface FormData {
  // Personal info
  firstName: string
  lastName: string
  email: string

  // Password
  currentPassword: string
  newPassword: string
  confirmPassword: string

  // Billing
  customerType: "individual" | "company"
  invoiceType: "receipt" | "invoice"
  companyName: string
  nip: string
  billingFirstName: string
  billingLastName: string
  billingStreet: string
  billingCity: string
  billingPostal: string
  billingCountry: string
  billingPhone: string
  billingPhoneCode: string

  // Shipping
  shippingFirstName: string
  shippingLastName: string
  shippingStreet: string
  shippingCity: string
  shippingPostal: string
  shippingCountry: string
  shippingPhone: string
  shippingPhoneCode: string
  sameAsBilling: boolean
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [loadingGus, setLoadingGus] = useState(false)

  // Editing states
  const [isEditingPersonal, setIsEditingPersonal] = useState(false)
  const [isEditingBilling, setIsEditingBilling] = useState(false)
  const [isEditingShipping, setIsEditingShipping] = useState(false)

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Single form state
  const [form, setForm] = useState<FormData>({
    // Personal info
    firstName: "",
    lastName: "",
    email: "",

    // Password
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",

    // Billing
    customerType: "individual",
    invoiceType: "receipt",
    companyName: "",
    nip: "",
    billingFirstName: "",
    billingLastName: "",
    billingStreet: "",
    billingCity: "",
    billingPostal: "",
    billingCountry: "Polska",
    billingPhone: "",
    billingPhoneCode: "+48",

    // Shipping
    shippingFirstName: "",
    shippingLastName: "",
    shippingStreet: "",
    shippingCity: "",
    shippingPostal: "",
    shippingCountry: "Polska",
    shippingPhone: "",
    shippingPhoneCode: "+48",
    sameAsBilling: false,
  })

  // Fetch user data on mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchUserData()
    }
  }, [session])

  const fetchGus = async () => {

    if (form.nip.length < 10) return
    console.log(form.nip);
    setLoadingGus(true)

    const res = await fetch('/api/gus', {
      method: 'POST',
      body: JSON.stringify({ nip: form.nip })
    })

    const data = await res.json()
    console.log(data);
    if (!data.error) {
      setForm(prev => ({
        ...prev,
        companyName: data.Nazwa,
        billingFirstName: data.firstname,
        billingLastName: data.lastname,
        billingStreet: data.street,
        billingCity: data.Miejscowosc,
        billingPostal: data.KodPocztowy
      }))
    }

    setLoadingGus(false)
  }

  const fetchUserData = async () => {
    setIsLoading(true)
    try {
      console.log("UUID:", session?.user?.id)
      // if (form.billingFirstName != "") return;
      const response = await fetch('/api/user/getuser', {
        method: 'POST',
        body: JSON.stringify({ uid: session?.user?.id }),
        cache: 'no-store' // to rozwiązuje problem cache
      })


      const data = await response.json()

      if (data.success && data.data) {
        const userData = data.data

        setForm(prev => ({
          ...prev,
          // Personal info
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',

          // Billing
          ...(userData.billingAddress && {
            customerType: userData.billingAddress.customerType || 'individual',
            invoiceType: userData.billingAddress.invoiceType || 'receipt',
            companyName: userData.billingAddress.companyName || '',
            nip: userData.billingAddress.nip || '',
            billingFirstName: userData.billingAddress.firstName || userData.firstName || '',
            billingLastName: userData.billingAddress.lastName || userData.lastName || '',
            billingStreet: userData.billingAddress.street || '',
            billingCity: userData.billingAddress.city || '',
            billingPostal: userData.billingAddress.postal || '',
            billingCountry: userData.billingAddress.country || 'Polska',
          }),

          // Shipping
          ...(userData.shippingAddress && {
            sameAsBilling: userData.shippingAddress.sameAsBilling || false,
            shippingFirstName: userData.shippingAddress.firstName || userData.firstName || '',
            shippingLastName: userData.shippingAddress.lastName || userData.lastName || '',
            shippingStreet: userData.shippingAddress.street || '',
            shippingCity: userData.shippingAddress.city || '',
            shippingPostal: userData.shippingAddress.postal || '',
            shippingCountry: userData.shippingAddress.country || 'Polska',
          }),
        }))

        // Parse phone numbers
        if (userData.phone) {
          const phoneMatch = userData.phone.match(/^(\+\d{1,3})\s?(.+)$/)
          if (phoneMatch) {
            setForm(prev => ({
              ...prev,
              billingPhoneCode: phoneMatch[1],
              billingPhone: phoneMatch[2],
              shippingPhoneCode: phoneMatch[1],
              shippingPhone: phoneMatch[2],
            }))
          } else {
            setForm(prev => ({
              ...prev,
              billingPhone: userData.phone,
              shippingPhone: userData.phone,
            }))
          }
        }
      } else {
        setMessage(data.message || 'Nie udało się pobrać danych użytkownika')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setMessage('Wystąpił błąd podczas pobierania danych użytkownika')
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

  const handleSaveProfile = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      // Save personal data
      const personalResponse = await fetch("https://sklep.carinii.com.pl/directseo/nextjs/user/editUser.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: session?.user?.id,
          type: "personal",
          firstName: form.firstName,
          lastName: form.lastName,
        }),
      })

      const personalData = await personalResponse.json()

      if (!personalData.success) {
        setMessage(personalData.message || "Błąd podczas aktualizacji danych konta")
        setIsLoading(false)
        return
      }

      // If password fields are filled, change password
      if (form.currentPassword && form.newPassword && form.confirmPassword) {
        if (form.newPassword !== form.confirmPassword) {
          setMessage("Nowe hasła nie są identyczne")
          setIsLoading(false)
          return
        }

        if (form.newPassword.length < 8) {
          setMessage("Nowe hasło musi mieć minimum 8 znaków")
          setIsLoading(false)
          return
        }

        const passwordResponse = await fetch("https://sklep.carinii.com.pl/directseo/nextjs/user/editUser.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: session?.user?.id,
            type: "password",
            currentPassword: form.currentPassword,
            newPassword: form.newPassword,
          }),
        })

        const passwordData = await passwordResponse.json()

        if (!passwordData.success) {
          setMessage(passwordData.message || "Błąd podczas zmiany hasła")
          setIsLoading(false)
          return
        }

        // Clear password fields on success
        setForm(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }))
        setMessage("Dane konta i hasło zaktualizowane pomyślnie!")
      } else {
        setMessage("Dane konta zaktualizowane pomyślnie!")
      }

      setIsEditingPersonal(false)
    } catch (error) {
      setMessage("Wystąpił błąd podczas zapisywania danych")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveBillingAddress = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("https://sklep.carinii.com.pl/directseo/nextjs/user/editUser.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: session?.user?.id,
          type: "billing",
          phone: form.billingPhoneCode + form.billingPhone,
          billingAddress: {
            firstName: form.billingFirstName || form.firstName || undefined,
            lastName: form.billingLastName || form.lastName || undefined,
            customerType: form.customerType,
            invoiceType: form.invoiceType,
            companyName: form.customerType === "company" ? form.companyName : undefined,
            nip: form.customerType === "company" ? form.nip : undefined,
            street: form.billingStreet,
            city: form.billingCity,
            postal: form.billingPostal,
            country: form.billingCountry,
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage("Adres rozliczeniowy zaktualizowany pomyślnie!")
        setIsEditingBilling(false)
      } else {
        setMessage(data.message || "Błąd podczas aktualizacji adresu")
      }
    } catch (error) {
      setMessage("Wystąpił błąd podczas zapisywania adresu")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveShippingAddress = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("https://sklep.carinii.com.pl/directseo/nextjs/user/editUser.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: session?.user?.id,
          type: "shipping",
          phone: form.sameAsBilling
            ? (form.billingPhoneCode + form.billingPhone)
            : (form.shippingPhoneCode + form.shippingPhone),
          shippingAddress: form.sameAsBilling
            ? {
              firstName: form.billingFirstName || form.firstName || undefined,
              lastName: form.billingLastName || form.lastName || undefined,
              street: form.billingStreet,
              city: form.billingCity,
              postal: form.billingPostal,
              country: form.billingCountry,
              sameAsBilling: true,
            }
            : {
              firstName: form.shippingFirstName || form.firstName || undefined,
              lastName: form.shippingLastName || form.lastName || undefined,
              street: form.shippingStreet,
              city: form.shippingCity,
              postal: form.shippingPostal,
              country: form.shippingCountry,
              sameAsBilling: false,
            },
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage("Adres dostawy zaktualizowany pomyślnie!")
        setIsEditingShipping(false)
      } else {
        setMessage(data.message || "Błąd podczas aktualizacji adresu")
      }
    } catch (error) {
      setMessage("Wystąpił błąd podczas zapisywania adresu")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (form.newPassword !== form.confirmPassword) {
      setMessage("Nowe hasła nie są identyczne")
      return
    }

    if (form.newPassword.length < 8) {
      setMessage("Nowe hasło musi mieć minimum 8 znaków")
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("https://sklep.carinii.com.pl/directseo/nextjs/user/editUser.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: session?.user?.id,
          type: "password",
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage("Hasło zmienione pomyślnie!")
        setForm(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }))
      } else {
        setMessage(data.message || "Błąd podczas zmiany hasła")
      }
    } catch (error) {
      setMessage("Wystąpił błąd podczas zmiany hasła")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Mój Profil</h1>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${message.includes("pomyślnie")
            ? "bg-green-50 text-green-800 border border-green-200"
            : "bg-red-50 text-red-800 border border-red-200"
            }`}
        >
          {message}
        </div>
      )}

      {/* Account Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Konto
              </CardTitle>
              <CardDescription>Zaktualizuj swoje dane konta i hasło</CardDescription>
            </div>
            {!isEditingPersonal && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingPersonal(true)}
                className="flex items-center gap-2 bg-hgold text-white hover:bg-hgold/90"
              >
                <Edit className="h-4 w-4" />
                Edytuj
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditingPersonal ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground mb-1">Imię:</p>
                  <p className="font-medium">{form.firstName || "Nie podano"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Nazwisko:</p>
                  <p className="font-medium">{form.lastName || "Nie podano"}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email:
                </p>
                <p className="font-medium">{form.email || "Nie podano"}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground mb-1 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Hasło:
                </p>
                <p className="font-medium">••••••••</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Imię</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Jan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nazwisko</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Kowalski"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                  {form.email || "Nie podano"}
                </div>
                <p className="text-xs text-muted-foreground">Adres email nie może być zmieniony</p>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Zmiana hasła
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Obecne hasło</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={form.currentPassword}
                      onChange={(e) => setForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nowe hasło</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={form.newPassword}
                      onChange={(e) => setForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum 8 znaków</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="flex-1 bg-hert hover:bg-hert/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Zapisywanie...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Zapisz dane konta
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setIsEditingPersonal(false)} disabled={isLoading}>
                  Anuluj
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Adres rozliczeniowy
              </CardTitle>
              <CardDescription>Adres do faktur i rozliczeń</CardDescription>
            </div>
            {!isEditingBilling && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingBilling(true)}
                className="flex items-center gap-2 bg-hgold text-white hover:bg-hgold/90"
              >
                <Edit className="h-4 w-4" />
                Edytuj
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditingBilling ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground mb-1">Imię:</p>
                  <p className="font-medium">{form.billingFirstName || "Nie podano"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Nazwisko:</p>
                  <p className="font-medium">{form.billingLastName || "Nie podano"}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground mb-1">Typ klienta:</p>
                <p className="font-medium">{form.customerType === "individual" ? "Osoba fizyczna" : "Firma"}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Dokument:</p>
                <p className="font-medium">{form.invoiceType === "receipt" ? "Paragon" : "Faktura VAT"}</p>
              </div>
              {form.customerType === "company" && (
                <>
                  <div>
                    <p className="text-muted-foreground mb-1 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Nazwa firmy:
                    </p>
                    <p className="font-medium">{form.companyName || "Nie podano"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      NIP:
                    </p>
                    <p className="font-medium">{form.nip || "Nie podano"}</p>
                  </div>
                </>
              )}
              <Separator />
              <div>
                <p className="text-muted-foreground mb-1">Ulica i numer:</p>
                <p className="font-medium">{form.billingStreet || "Nie podano"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground mb-1">Miasto:</p>
                  <p className="font-medium">{form.billingCity || "Nie podano"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Kod pocztowy:</p>
                  <p className="font-medium">{form.billingPostal || "Nie podano"}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Kraj:</p>
                <p className="font-medium">{form.billingCountry || "Nie podano"}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefon:
                </p>
                <p className="font-medium">{form.billingPhone ? `${form.billingPhoneCode} ${form.billingPhone}` : "Nie podano"}</p>
              </div>
            </div>
          ) : (
            <>
              {/* First Name and Last Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billingFirstName">Imię</Label>
                  <Input
                    id="billingFirstName"
                    value={form.billingFirstName}
                    onChange={(e) => setForm(prev => ({ ...prev, billingFirstName: e.target.value }))}
                    placeholder="Jan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingLastName">Nazwisko</Label>
                  <Input
                    id="billingLastName"
                    value={form.billingLastName}
                    onChange={(e) => setForm(prev => ({ ...prev, billingLastName: e.target.value }))}
                    placeholder="Kowalski"
                  />
                </div>
              </div>

              <Separator />

              {/* Customer Type Selection */}
              <div className="space-y-2">
                <Label>Typ klienta</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="individual"
                      name="customerType"
                      value="individual"
                      checked={form.customerType === "individual"}
                      onChange={(e) => {
                        setForm(prev => ({
                          ...prev,
                          customerType: e.target.value as "individual" | "company",
                          invoiceType: 'receipt'
                        }))
                      }}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="individual" className="cursor-pointer font-normal">
                      Osoba fizyczna
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="company"
                      name="customerType"
                      value="company"
                      checked={form.customerType === "company"}
                      onChange={(e) => {
                        setForm(prev => ({
                          ...prev,
                          customerType: e.target.value as "individual" | "company",
                          invoiceType: 'invoice'
                        }))
                      }}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="company" className="cursor-pointer font-normal">
                      Firma
                    </Label>
                  </div>
                </div>
              </div>

              {/* Invoice Type Selection */}
              <div className="space-y-2">
                <Label>Dokument</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="receipt"
                      name="invoiceType"
                      value="receipt"
                      checked={form.invoiceType === "receipt"}
                      onChange={(e) => setForm(prev => ({ ...prev, invoiceType: e.target.value as "receipt" | "invoice" }))}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="receipt" className="cursor-pointer font-normal">
                      Paragon
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="invoice"
                      name="invoiceType"
                      value="invoice"
                      checked={form.invoiceType === "invoice"}
                      onChange={(e) => setForm(prev => ({ ...prev, invoiceType: e.target.value as "receipt" | "invoice" }))}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="invoice" className="cursor-pointer font-normal">
                      Faktura VAT
                    </Label>
                  </div>
                </div>
              </div>

              {/* Company Fields - Only visible when company is selected */}
              {form.customerType === "company" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Nazwa firmy
                    </Label>
                    <Input
                      id="companyName"
                      value={form.companyName}
                      onChange={(e) => setForm(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Firma Sp. z o.o."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nip" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      NIP
                    </Label>
                    <Input
                      id="nip"
                      value={form.nip}
                      onChange={(e) => {
                        setForm(prev => ({ ...prev, nip: formatNIP(e.target.value) }));

                      }}
                      onBlur={fetchGus}
                    />
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="billingStreet">Ulica i numer</Label>
                <Input
                  id="billingStreet"
                  value={form.billingStreet}
                  onChange={(e) => setForm(prev => ({ ...prev, billingStreet: e.target.value }))}
                  placeholder="ul. Główna 123"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billingCity">Miasto</Label>
                  <Input
                    id="billingCity"
                    value={form.billingCity}
                    onChange={(e) => setForm(prev => ({ ...prev, billingCity: e.target.value }))}
                    placeholder="Warszawa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingPostal">Kod pocztowy</Label>
                  <Input
                    id="billingPostal"
                    value={form.billingPostal}
                    onChange={(e) => setForm(prev => ({ ...prev, billingPostal: e.target.value }))}
                    placeholder="00-001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingCountry">Kraj</Label>
                <Input
                  id="billingCountry"
                  value={form.billingCountry}
                  onChange={(e) => setForm(prev => ({ ...prev, billingCountry: e.target.value }))}
                  placeholder="Polska"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingPhone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefon
                </Label>
                <div className="flex gap-2">
                  <select
                    value={form.billingPhoneCode}
                    onChange={(e) => setForm(prev => ({ ...prev, billingPhoneCode: e.target.value }))}
                    className="w-24 rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="+48">🇵🇱 +48</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+33">🇫🇷 +33</option>
                  </select>
                  <Input
                    id="billingPhone"
                    type="tel"
                    value={form.billingPhone}
                    onChange={(e) => setForm(prev => ({ ...prev, billingPhone: e.target.value.replace(/\D/g, "") }))}
                    placeholder="123456789"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveBillingAddress}
                  disabled={isLoading}
                  className="flex-1 bg-hert hover:bg-hert/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Zapisywanie...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Zapisz adres
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setIsEditingBilling(false)} disabled={isLoading}>
                  Anuluj
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Adres dostawy
              </CardTitle>
              <CardDescription>Adres, na który mają być wysyłane zamówienia</CardDescription>
            </div>
            {!isEditingShipping && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingShipping(true)}
                className="flex items-center gap-2 bg-hgold text-white hover:bg-hgold/90"
              >
                <Edit className="h-4 w-4" />
                Edytuj
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditingShipping ? (
            <div className="space-y-3 text-sm">
              {form.sameAsBilling ? (
                <p className="text-muted-foreground italic">Taki sam jak adres rozliczeniowy</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground mb-1">Imię:</p>
                      <p className="font-medium">{form.shippingFirstName || "Nie podano"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Nazwisko:</p>
                      <p className="font-medium">{form.shippingLastName || "Nie podano"}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground mb-1">Ulica i numer:</p>
                    <p className="font-medium">{form.shippingStreet || "Nie podano"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground mb-1">Miasto:</p>
                      <p className="font-medium">{form.shippingCity || "Nie podano"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Kod pocztowy:</p>
                      <p className="font-medium">{form.shippingPostal || "Nie podano"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Kraj:</p>
                    <p className="font-medium">{form.shippingCountry || "Nie podano"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefon:
                    </p>
                    <p className="font-medium">{form.shippingPhone ? `${form.shippingPhoneCode} ${form.shippingPhone}` : "Nie podano"}</p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sameAsBilling"
                  checked={form.sameAsBilling}
                  onChange={(e) => setForm(prev => ({ ...prev, sameAsBilling: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="sameAsBilling" className="cursor-pointer">
                  Taki sam jak adres rozliczeniowy
                </Label>
              </div>

              {!form.sameAsBilling && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shippingFirstName">Imię</Label>
                      <Input
                        id="shippingFirstName"
                        value={form.shippingFirstName}
                        onChange={(e) => setForm(prev => ({ ...prev, shippingFirstName: e.target.value }))}
                        placeholder="Jan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingLastName">Nazwisko</Label>
                      <Input
                        id="shippingLastName"
                        value={form.shippingLastName}
                        onChange={(e) => setForm(prev => ({ ...prev, shippingLastName: e.target.value }))}
                        placeholder="Kowalski"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="shippingStreet">Ulica i numer</Label>
                    <Input
                      id="shippingStreet"
                      value={form.shippingStreet}
                      onChange={(e) => setForm(prev => ({ ...prev, shippingStreet: e.target.value }))}
                      placeholder="ul. Główna 123"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shippingCity">Miasto</Label>
                      <Input
                        id="shippingCity"
                        value={form.shippingCity}
                        onChange={(e) => setForm(prev => ({ ...prev, shippingCity: e.target.value }))}
                        placeholder="Warszawa"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingPostal">Kod pocztowy</Label>
                      <Input
                        id="shippingPostal"
                        value={form.shippingPostal}
                        onChange={(e) => setForm(prev => ({ ...prev, shippingPostal: e.target.value }))}
                        placeholder="00-001"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingCountry">Kraj</Label>
                    <Input
                      id="shippingCountry"
                      value={form.shippingCountry}
                      onChange={(e) => setForm(prev => ({ ...prev, shippingCountry: e.target.value }))}
                      placeholder="Polska"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingPhone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefon
                    </Label>
                    <div className="flex gap-2">
                      <select
                        value={form.shippingPhoneCode}
                        onChange={(e) => setForm(prev => ({ ...prev, shippingPhoneCode: e.target.value }))}
                        className="w-24 rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value="+48">🇵🇱 +48</option>
                        <option value="+49">🇩🇪 +49</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+33">🇫🇷 +33</option>
                      </select>
                      <Input
                        id="shippingPhone"
                        type="tel"
                        value={form.shippingPhone}
                        onChange={(e) => setForm(prev => ({ ...prev, shippingPhone: e.target.value.replace(/\D/g, "") }))}
                        placeholder="123456789"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveShippingAddress}
                  disabled={isLoading}
                  className="flex-1 bg-hert hover:bg-hert/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Zapisywanie...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Zapisz adres
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setIsEditingShipping(false)} disabled={isLoading}>
                  Anuluj
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}