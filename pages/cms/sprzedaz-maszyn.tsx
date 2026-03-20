'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, AlertCircle } from 'lucide-react'

interface FormData {
    companyName: string
    name: string
    email: string
    phone: string
    machineDescription: string
    files: File[]
}

const PRIMARY_COLOR = '#431c49'
const ACCENT_COLOR = '#e2b87f'

export default function SellMachinePage() {
    const [formData, setFormData] = useState<FormData>({
        companyName: '',
        name: '',
        email: '',
        phone: '',
        machineDescription: '',
        files: [],
    })
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isDragActive, setIsDragActive] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragActive(e.type === 'dragenter' || e.type === 'dragover')
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragActive(false)

        const droppedFiles = Array.from(e.dataTransfer.files)
        setFormData((prev) => ({
            ...prev,
            files: [...prev.files, ...droppedFiles],
        }))
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || [])
        setFormData((prev) => ({
            ...prev,
            files: [...prev.files, ...selectedFiles],
        }))
    }

    const removeFile = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index),
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('[v0] Form submitted:', formData)
        setIsSubmitted(true)
        setTimeout(() => {
            setFormData({
                companyName: '',
                name: '',
                email: '',
                phone: '',
                machineDescription: '',
                files: [],
            })
            setIsSubmitted(false)
        }, 3000)
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-12 space-y-4">
                    <h1 className="text-4xl font-bold text-gray-900">Maszyny na sprzedaż</h1>
                    <p className="text-lg text-gray-700">
                        Jeżeli masz używaną maszynę do przetwarzania żywności o wysokiej jakości i chciałbyś ją sprzedać, chętnie ją od Ciebie odkupumy! U nas szybka sprzedaż osiągniesz, otrzymując konkurencyjną cenę.
                    </p>
                    <p className="text-base text-gray-700">
                        Aby sprzedać zbędny sprzęt, podaj jak najwięcej szczegółów, tam markę, model, wiek, stan i załącz zdjęcia.
                    </p>
                    <div className="mt-6 rounded-lg bg-blue-50 border border-blue-200 p-4 flex gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-900">
                            Ewentualnie jeśli chcesz omówić dowolny aspekt procesu sprzedazy, skontaktuj się z nami telefonicznie pod numerem telefonu:{' '}
                            <span className="font-semibold">532 341 242</span> bądź emailowo:{' '}
                            <span className="font-semibold">skontaktuj się</span>
                        </p>
                    </div>
                </div>

                {/* Form Section */}
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Form Fields */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Company Name */}
                            <div className="space-y-2">
                                <Label htmlFor="companyName" className="text-sm font-semibold">
                                    Nazwa firmy
                                </Label>
                                <Input
                                    id="companyName"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleInputChange}
                                    placeholder="Podaj nazwę firmy"
                                    className="border-gray-300 py-2"
                                />
                            </div>

                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold">
                                    Imię i Nazwisko
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Podaj swoje imię i nazwisko"
                                    className="border-gray-300 py-2"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold">
                                    Adres emailowy
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Podaj swój adres email"
                                    className="border-gray-300 py-2"
                                />
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-semibold">
                                    Numer kontaktowy
                                </Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="numer w formacie +48 000 000 000"
                                    className="border-gray-300 py-2"
                                />
                            </div>

                            {/* Machine Description */}
                            <div className="space-y-2">
                                <Label htmlFor="machineDescription" className="text-sm font-semibold">
                                    Opis maszyny
                                </Label>
                                <Textarea
                                    id="machineDescription"
                                    name="machineDescription"
                                    value={formData.machineDescription}
                                    onChange={handleInputChange}
                                    placeholder="Podaj szczegółowy opis maszyny, jej stan, wymiary, itp."
                                    className="min-h-32 resize-none border-gray-300"
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

                            {/* GDPR Notice */}
                            <p className="text-xs text-gray-500">
                                * pola wymagane
                            </p>
                        </form>
                    </div>

                    {/* File Upload Section */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-4">
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all ${isDragActive
                                    ? 'border-[#431c49] bg-purple-50'
                                    : 'border-[#e2b87f] bg-white hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div
                                        className="rounded-full p-4"
                                        style={{ backgroundColor: `${ACCENT_COLOR}20` }}
                                    >
                                        <Upload className="h-6 w-6" style={{ color: ACCENT_COLOR }} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Przeciągnij pliki</p>
                                        <p className="text-sm text-gray-600">w to miejsce</p>
                                    </div>
                                    <p className="text-xs text-gray-500">lub</p>
                                    <Label className="cursor-pointer">
                                        <span
                                            className="font-semibold"
                                            style={{ color: PRIMARY_COLOR }}
                                        >
                                            kliknij aby wybrać
                                        </span>
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            accept="image/*,.pdf,.doc,.docx"
                                        />
                                    </Label>
                                </div>
                            </div>

                            {/* Uploaded Files */}
                            {formData.files.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-gray-900">
                                        Pliki ({formData.files.length})
                                    </p>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {formData.files.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-lg bg-gray-100 p-3 text-sm"
                                            >
                                                <span className="truncate text-gray-700">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="text-red-600 hover:text-red-700 font-semibold"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Success Message */}
                            {isSubmitted && (
                                <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                                    <p className="text-sm text-green-800 font-semibold">
                                        Dziękujemy! Twoja wiadomość została wysłana.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
