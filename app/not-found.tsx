'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
            <div className="text-center space-y-8 max-w-2xl">
                {/* Error Code */}
                <div className="space-y-2">
                    <h1 className="text-9xl font-bold" style={{ color: '#431c49' }}>
                        404
                    </h1>
                    <div
                        className="text-2xl font-semibold text-hcar"
                    >
                        Strona nie znaleziona
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                    <p className="text-lg text-gray-600">
                        Przepraszamy! Strona, którą szukasz, nie istnieje lub została przeniesiona.
                    </p>
                    <p className="text-base text-gray-500">
                        Sprawdź adres URL lub wróć do strony głównej, aby kontynuować przeglądanie naszej oferty maszyn.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <Link href="/">
                        <Button
                            className="w-full sm:w-auto gap-2 text-white py-6 px-8 text-base bg-hcar"
                        >
                            <Home className="w-5 h-5" />
                            Strona główna
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto gap-2 py-5.5 px-8 text-base border-2 hover:text-white"
                        style={{ borderColor: '#431c49' }}
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="w-5 h-5 text-hcar" />
                        Wróć wstecz
                    </Button>
                </div>

                {/* Helpful Links */}
                <div className="border-t border-gray-200 pt-8 mt-8">
                    <p className="text-sm text-gray-600 mb-4">Przydatne linki:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Link
                            href="/nowosci.html"
                            className="block p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-left"
                        >
                            <h3 className="font-semibold text-gray-900 text-sm">
                                Nowości
                            </h3>
                            <p className="text-gray-600 text-xs">To się będzie nosić</p>
                        </Link>
                        <Link
                            href="/kontakt"
                            className="block p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-left"
                        >
                            <h3 className="font-semibold text-gray-900 text-sm">
                                Kontakt
                            </h3>
                            <p className="text-gray-600 text-xs">Skontaktuj się z nami</p>
                        </Link>
                        <Link
                            href="/torebki.html"
                            className="block p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-left"
                        >
                            <h3 className="font-semibold text-gray-900 text-sm">
                                Torbeki
                            </h3>
                            <p className="text-gray-600 text-xs">Nie samymi butami człowiek żyje :)</p>
                        </Link>
                        <Link
                            href="/kontakt"
                            className="block p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-left"
                        >
                            <h3 className="font-semibold text-gray-900 text-sm">
                                Pomoc
                            </h3>
                            <p className="text-gray-600 text-xs">Sprawdź nasze FAQ</p>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}
