import { Geist_Mono } from "next/font/google"

// Jeden krój w całej strefie Maison. Zmienna CSS jest ustawiana na korzeniu .maison.
export const geistMono = Geist_Mono({
    subsets: ["latin", "latin-ext"],
    weight: ["300", "400", "500"],
    variable: "--font-geist-mono",
    display: "swap",
})
