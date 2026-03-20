// Template dla stron sklepu (koszyk, checkout, itp.)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag } from "lucide-react"

interface ShopTemplateProps {
    slug: string[]
    pageType: "cart" | "checkout" | "order" | "other"
}

export function ShopTemplate({ slug, pageType }: ShopTemplateProps) {
    const titles = {
        cart: "Koszyk",
        checkout: "Finalizacja zamówienia",
        order: "Twoje zamówienie",
        other: "Sklep",
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="h-8 w-8 text-primary" />
                        <div>
                            <CardTitle className="text-3xl font-bold">{titles[pageType]}</CardTitle>
                            <CardDescription>Strona: {slug.join(" / ")}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">Template dla strony sklepu typu: {pageType}</p>
                        <p className="text-sm text-muted-foreground mt-2">Tutaj będzie implementacja funkcjonalności sklepu</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
