import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import MaisonHeader from "@/components/maison/MaisonHeader"
import MaisonFilm from "@/components/maison/MaisonFilm"
import { getMaisonProducts } from "@/lib/maison"
import { formatMaisonPrice, MAISON_PATHS } from "@/lib/maisonShared"

// Ceny i linki wyróżnionych modeli czytamy z Typesense; strona odświeża się co minutę.
export const revalidate = 60

export const metadata: Metadata = {
    title: "Maison Carinii — ekskluzywna kolekcja kozaków i botek",
    description:
        "Maison Carinii: awangardowe kozaki i botki o rzeźbiarskich proporcjach, z najszlachetniejszych skór. Kolekcja 01 — Designed to be collected.",
    alternates: { canonical: MAISON_PATHS.home },
    openGraph: {
        title: "Maison Carinii",
        description: "Awangardowe kozaki i botki o rzeźbiarskich proporcjach. Designed to be collected.",
        url: MAISON_PATHS.home,
        images: [{ url: "/maison/hero_float.jpg", width: 1000, height: 1500, alt: "Maison Carinii" }],
    },
}

// Cztery modele z kampanii: zdjęcie i opis z projektu strefy, cena i adres produktu z Typesense (po początku SKU).
const FEATURED = [
    { sku: "M008-E50", image: "hero_float.jpg", name: "Thea Over-The-Knee Boots", material: "Nappa stretch", alt: "Thea Over-The-Knee Boots — czarne kozaki za kolano z marszczoną cholewką" },
    { sku: "M014-U02", image: "m014.jpg", name: "Colette Long Boots", material: "Skóra tłoczona w krokodyla", alt: "Colette Long Boots — beżowy kozak ze skóry tłoczonej w krokodyla na szpilce" },
    { sku: "M010-688", image: "m009.jpg", name: "Zelie Over-The-Knee Boots", material: "Błyszczący stretch", alt: "Zelie Over-The-Knee Boots — bordowe kozaki za kolano z marszczoną cholewką i rzeźbionym koturnem" },
    { sku: "M003-662", image: "m003.jpg", name: "Odette Long Boots", material: "Skóra z wężowym wykończeniem", alt: "Odette Long Boots — kozaki ze skóry z wężowym wykończeniem" },
] as const

const EDITORIAL_SIZES = "(min-width: 1024px) 60vw, 100vw"

export default async function MaisonHomePage() {
    const products = await getMaisonProducts("all")

    return (
        <>
            <MaisonFilm
                src="/maison/buty_poziom1.mp4"
                poster="/maison/buty_poster.jpg"
                label="Film kampanii Maison Carinii — Kolekcja 01"
                preload="auto"
            >
                <MaisonHeader overlay />
                <Link className="mz-cta mz-hero-cta" href={MAISON_PATHS.collection}>Odkryj kolekcję Maison Carinii</Link>
            </MaisonFilm>

            <section className="mz-intro mz-wrap">
                <Image src="/maison/logo_stacked_white.svg" alt="Maison Carinii" width={300} height={300} unoptimized />
                <p>
                    W Maison Carinii moda jest formą sztuki. Każdy model to awangardowy projekt o rzeźbiarskich proporcjach.
                    Wyrazista linia cholewki i rzeźbiony obcas tworzą jedną, spójną kompozycję. Powstaje z najszlachetniejszych skór,
                    z precyzją, która nie zna kompromisów. To nie sezonowy dodatek, lecz element kolekcji.
                </p>
            </section>

            <section className="mz-wrap" id="kolekcja" aria-label="Kolekcja 01">
                <div className="mz-collect-h"><h2>Odkryj kolekcję Maison Carinii</h2></div>
                <div className="mz-featured">
                    {FEATURED.map((item, index) => {
                        const product = products.find((candidate) => candidate.sku.startsWith(item.sku))
                        const price = product ? formatMaisonPrice(product.specialPrice ?? product.price) : "Cena w sklepie"
                        return (
                            <Link key={item.sku} className="mz-card" href={product ? `/${product.slug}` : MAISON_PATHS.collection}>
                                <span className="mz-card-media">
                                    <Image src={`/maison/${item.image}`} alt={item.alt} fill sizes="(min-width: 960px) 400px, 50vw" priority={index < 2} />
                                </span>
                                <span className="mz-card-body">
                                    <span className="mz-card-row">
                                        <span className="mz-card-name">{item.name}</span>
                                        <span className="mz-card-price">{price}</span>
                                    </span>
                                    <span className="mz-card-note">{item.material}</span>
                                </span>
                            </Link>
                        )
                    })}
                </div>
                <div className="mz-more"><Link className="mz-cta" href={MAISON_PATHS.collection}>Odkryj kolekcję →</Link></div>
            </section>

            <section className="mz-ed mz-wrap" aria-label="Kampania">
                <div className="mz-label"><h2>Kampania</h2><span>Kolekcja 01</span></div>

                <figure style={{ gridColumn: "1/9" }}>
                    <Image className="mz-r23" src="/maison/trio.jpg" alt="Trzy postacie na czarnej skórzanej sofie, dwie modelki w czarnych kozakach Maison Carinii" width={1200} height={1800} sizes={EDITORIAL_SIZES} />
                </figure>
                <div className="mz-txt" style={{ gridColumn: "10/13" }}>
                    <h3>Forma przed modą.</h3>
                    <p>Linia cholewki, kształt obcasa i detal tworzą jedną kompozycję. Każdy model ma własną, rozpoznawalną konstrukcję.</p>
                </div>

                <figure className="mz-bleed">
                    <Image src="/maison/bag_shoulder.jpg" alt="Model z czarnym workiem Maison Carinii przewieszonym przez ramię" width={1500} height={1000} sizes="100vw" />
                </figure>

                <figure style={{ gridColumn: "1/6", alignSelf: "end" }}>
                    <Image className="mz-r23" src="/maison/male_snake.jpg" alt="Model na czarnej sofie z kozakami we wzór węża" width={1200} height={1800} sizes={EDITORIAL_SIZES} />
                    <figcaption>Odette Long Boots</figcaption>
                </figure>
                <figure style={{ gridColumn: "7/13" }}>
                    <Image className="mz-r23" src="/maison/leg_raise.jpg" alt="Modelka w szarym trenczu unosi nogę w czarnym kozaku" width={1000} height={1500} sizes={EDITORIAL_SIZES} />
                </figure>

                <p className="mz-statement">Designed<br />to be collected.</p>

                <figure style={{ gridColumn: "1/5" }}>
                    <Image className="mz-r45" src="/maison/cord.jpg" alt="Czarny worek Maison Carinii ze spiralnym sznurkiem" width={1000} height={1500} sizes="(min-width: 1024px) 30vw, 100vw" />
                    <figcaption>Dust bag</figcaption>
                </figure>
                <figure style={{ gridColumn: "5/9", marginTop: "18%" }}>
                    <Image className="mz-r45" src="/maison/insole.jpg" alt="Wkładka z sygnetem Maison Carinii" width={1000} height={1500} sizes="(min-width: 1024px) 30vw, 100vw" />
                    <figcaption>Podpis wewnątrz</figcaption>
                </figure>
                <figure style={{ gridColumn: "9/13" }}>
                    <Image className="mz-r45" src="/maison/zip.jpg" alt="Suwak z sygnetem M na skórze tłoczonej w krokodyla" width={1000} height={1500} sizes="(min-width: 1024px) 30vw, 100vw" />
                    <figcaption>Sygnet</figcaption>
                </figure>

                <figure style={{ gridColumn: "2/8" }}>
                    <Image className="mz-r23" src="/maison/hero_walk.jpg" alt="Modelka w szarej kurtce i czarnych kozakach w ruchu" width={1000} height={1500} sizes={EDITORIAL_SIZES} />
                </figure>
                <figure style={{ gridColumn: "9/12", alignSelf: "center" }}>
                    <Image className="mz-r23" src="/maison/croc_table.jpg" alt="Kozak na szpilce ze skóry tłoczonej w krokodyla na chromowanym stoliku" width={1000} height={1500} sizes="(min-width: 1024px) 25vw, 100vw" />
                </figure>

                <figure style={{ gridColumn: "4/10" }}>
                    <Image className="mz-r23" src="/maison/box.jpg" alt="Model trzymający czarne pudełko Maison Carinii" width={1000} height={1500} sizes={EDITORIAL_SIZES} />
                </figure>
            </section>

            <MaisonFilm
                src="/maison/buty_poziom2.mp4"
                poster="/maison/buty_poster2.jpg"
                label="Drugi film kampanii Maison Carinii — Kolekcja 01"
            />
        </>
    )
}
