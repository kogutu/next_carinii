'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Phone, Mail, MapPin, Clock, Smartphone } from 'lucide-react'

interface ContactFormData {
    name: string
    email: string
    phone: string
    message: string
}

const PRIMARY_COLOR = '#431c49'
const ACCENT_COLOR = '#e2b87f'

export default function ContactPage() {
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        email: '',
        phone: '',
        message: '',
    })
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('[v0] Contact form submitted:', formData)
        setIsSubmitted(true)
        setTimeout(() => {
            setFormData({
                name: '',
                email: '',
                phone: '',
                message: '',
            })
            setIsSubmitted(false)
        }, 3000)
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12 space-y-3">
                    <h1 className="text-4xl font-bold text-gray-900">Kontakt</h1>
                    <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="h-5 w-5" />
                        <p>Chętnie odpowiemy na Państwa pytania od poniedziałku do piątku: 08:00 - 16:00</p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-12 lg:grid-cols-3">
                    {/* Company Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Biuro Obsługi Klienta */}
                        <Card className="border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-6 space-y-4">
                                <h3 className="font-bold text-lg" style={{ color: PRIMARY_COLOR }}>
                                    Biuro Obsługi Klienta
                                </h3>

                                <div className="space-y-3 text-sm">
                                    {/* Phone */}
                                    <div className="flex gap-3">
                                        <Phone className="h-5 w-5 flex-shrink-0 text-gray-400 mt-0.5" />
                                        <div className="text-gray-700">
                                            <p className="text-xs text-gray-500">telefon stacjonarny</p>
                                            <p className="font-medium">+48 25 748 42 00</p>
                                        </div>
                                    </div>

                                    {/* Mobile */}
                                    <div className="flex gap-3">
                                        <Smartphone className="h-5 w-5 flex-shrink-0 text-gray-400 mt-0.5" />
                                        <div className="text-gray-700">
                                            <p className="text-xs text-gray-500">telefon komórkowy</p>
                                            <p className="font-medium">+48 504 270 628</p>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex gap-3">
                                        <Mail className="h-5 w-5 flex-shrink-0 text-gray-400 mt-0.5" />
                                        <div className="text-gray-700">
                                            <p className="text-xs text-gray-500">e-mail</p>
                                            <p className="font-medium">sklep@carinii.com.pl</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Adres firmy */}
                        <Card className="border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-6 space-y-4">
                                <h3 className="font-bold text-lg" style={{ color: PRIMARY_COLOR }}>
                                    Adres firmy
                                </h3>

                                <div className="space-y-3 text-sm">
                                    {/* Address */}
                                    <div className="flex gap-3">
                                        <MapPin className="h-5 w-5 flex-shrink-0 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-gray-700 font-medium">Z.P.O. CARINII</p>
                                            <p className="text-gray-700">ul. Warszawska 78</p>
                                            <p className="text-gray-700">08-450 Łaskarzew</p>
                                        </div>
                                    </div>

                                    {/* Company Details */}
                                    <div className="pt-3 border-t border-gray-200 space-y-1 text-xs text-gray-600">
                                        <p>NIP: <span className="font-mono">PL8261860220</span></p>
                                        <p>REGON: <span className="font-mono">711791712</span></p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card className="border-gray-200">
                            <CardContent className="p-8">
                                <h2 className="mb-6 text-2xl font-bold text-gray-900">Napisz do nas</h2>
                                <p className="mb-6 text-gray-700">
                                    Zostaw nam wiadomość, a my skontaktujemy się z Tobą szybko jak to możliwe.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-semibold">
                                            Nazwa <span className="text-red-600">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Podaj swoje imię i nazwisko"
                                            className="border-gray-300 py-2"
                                            required
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-semibold">
                                            E-mail <span className="text-red-600">*</span>
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Podaj swój adres email"
                                            className="border-gray-300 py-2"
                                            required
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm font-semibold">
                                            Numer telefonu
                                        </Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+48 000 000 000"
                                            className="border-gray-300 py-2"
                                        />
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-2">
                                        <Label htmlFor="message" className="text-sm font-semibold">
                                            W czym możemy Ci pomóc? <span className="text-red-600">*</span>
                                        </Label>
                                        <Textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            placeholder="Podaj szczegóły Twojej wiadomości"
                                            className="min-h-32 resize-none border-gray-300"
                                            required
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full py-6 text-white font-semibold"
                                        style={{ backgroundColor: PRIMARY_COLOR }}
                                    >
                                        Wyślij
                                    </Button>

                                    {/* Success Message */}
                                    {isSubmitted && (
                                        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                                            <p className="text-sm text-green-800 font-semibold">
                                                Dziękujemy! Twoja wiadomość została wysłana. Wkrótce się z Tobą skontaktujemy.
                                            </p>
                                        </div>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    )
}