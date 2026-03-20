import { Button } from "@/components/ui/button";
import { Briefcase, DollarSign, HelpCircle, Mail, Phone, User } from "lucide-react";
import { useState } from "react";

export default function ManagerSection({ product, setIsInquiryOpen, setIsPriceOpen }: { product: any, setIsInquiryOpen: (open: boolean) => void, setIsPriceOpen: (open: boolean) => void }) {
    const manager = product?.manager
    const phone = `${manager?.phone.slice(0, 3)} ${manager?.phone.slice(3, 6)} ${manager?.phone.slice(6, 9)}`

    const formatHiddenPhone = (phone: string) => {
        if (!phone) return '';
        const visiblePart = phone.slice(0, 3); // pokaż tylko 3 ostatnie cyfry
        return `${visiblePart} *** *** `;
    };
    const [showFullPhone, setShowFullPhone] = useState(false)
    if (!manager) {
        return null;
    }
    return (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            {/* Nagłówek */}
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-1">Masz pytania? Chcesz zlożyć większe zamówienie?</h3>
                <p className="text-sm text-gray-500">Skontaktuj się bezpośrednio</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">

                {/* Informacje o sprzedawcy */}
                <div className="space-y-4 mb-6">
                    <div className="flex items-start">
                        <User className="w-5 h-8 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-gray-500">Menedżer</p>
                            <p className="font-medium text-xl text-gray-900">{manager?.name}</p>
                        </div>
                    </div>




                    <div className="flex items-start">
                        <Phone className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                        <div>

                            <span className="font-medium text-xl text-gray-900">

                                {showFullPhone ? phone : formatHiddenPhone(manager.phone)}
                                <span
                                    className="text-blue-600 cursor-pointer ml-2 text-sm"
                                    onClick={() => setShowFullPhone(true)}
                                >
                                    {showFullPhone ? '' : 'pokaż pełny'}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Przyciski akcji */}
                <div className="grid gap-4">
                    <Button
                        onClick={() => setIsInquiryOpen(true)}
                        variant="outline"
                        className="border-2 text-sm py-6 bg-hert  text-white hover:bg-hhert cursor-pointer"

                    >
                        Zapytaj o produkt
                    </Button>

                    <Button
                        onClick={() => setIsPriceOpen(true)}
                        variant="outline"
                        className="border-2 bg-hgold py-6 text-sm text-hertwhite hover:bg-hgold hover:text-hert cursor-pointer"

                    >
                        Negocjuj cenę
                    </Button>
                </div>
            </div>
        </div>
    )
}


