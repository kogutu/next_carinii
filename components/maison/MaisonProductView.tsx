'use client'

import type React from "react"
import "./maison.css"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { geistMono } from "./font"
import MaisonProductCard from "./MaisonProductCard"
import WishlistButton from "@/components/wishlist/WishlistButton"
import PayButton from "@/components/payments/PayButton"
import { PayPoIcon } from "@/components/payments/BrandIcons"
import ExpressCheckout from "@/components/express/ExpressCheckout"
import TrustmateWidget from "@/components/trustmate/TrustmateWidget"
import { TRUSTMATE_HYDRA_TOKEN } from "@/lib/trustmate"
import { normalizeMediaUrl } from "@/lib/mediaUrl"
import { formatMaisonPrice, MAISON_PATHS, type MaisonProduct } from "@/lib/maisonShared"
import type { CartItem } from "@/stores/cartZustand"
import SizeSwatchBase from "@/pages/product/SizeSwatch"

// SizeSwatch nie ma typów propsów (plik z dawnego prototypu) — zawężamy tutaj, żeby nie rozlewać any
const SizeSwatch = SizeSwatchBase as React.ComponentType<{ theme: string; setVariant: (variant: any) => void; size_qty: unknown; sku: string; image_thumbnail?: string }>
import PromoBadge from "@/pages/product/promo-badge"

type MaisonProductViewProps = {
    product: any
    name: string
    descriptionHtml: string
    specs: Record<string, string>
    setVariant: (variant: any) => void
    errorVariant: boolean
    onAddToCart: () => void
    onAddPaypo: () => void
    getExpressItems: () => CartItem[] | null
    onBlockedClick: () => void
    more: MaisonProduct[]
    reviewsEmpty: boolean
    onReviewsEmpty: () => void
}

// Packshot (zdjęcie na białym tle) pokazujemy w całości, zdjęcia z sesji wypełniają kadr.
const isPackshot = (img: string) => /\/B\d+-M-[^/]*\.jpe?g$/i.test(img)

const GALLERY_SIZES = "(min-width: 1024px) 45vw, 82vw"

export default function MaisonProductView({
    product,
    name,
    descriptionHtml,
    specs,
    setVariant,
    errorVariant,
    onAddToCart,
    onAddPaypo,
    getExpressItems,
    onBlockedClick,
    more,
    reviewsEmpty,
    onReviewsEmpty,
}: MaisonProductViewProps) {
    const images: string[] = (product.imgs ?? []).map((img: string | { src: string }) => normalizeMediaUrl(typeof img === "string" ? img : img.src))
    const category = (product.cids_all ?? []).map(String).includes("345") ? "botki" : "kozaki"
    const categoryLabel = category === "botki" ? "Botki" : "Kozaki"
    const shortdesc = String(product.shortdesc ?? "").trim()
    // krótki opis bywa powtórzeniem nazwy — wtedy nie pokazujemy go drugi raz
    const tagline = shortdesc.toLowerCase() === name.toLowerCase() ? "" : shortdesc
    const onSale = Boolean(product.has_special_price) && Number(product.final_price) < Number(product.price)
    const specEntries = Object.entries(specs)

    return (
        <div className={`maison ${geistMono.variable}`}>
            <div className="mz-pdp mz-wrap">
                <nav className="mz-crumbs" aria-label="Okruszki">
                    <Link href={MAISON_PATHS.home}>Maison Carinii</Link>
                    <span aria-hidden="true">/</span>
                    <Link href={category === "botki" ? MAISON_PATHS.botki : MAISON_PATHS.kozaki}>{categoryLabel}</Link>
                </nav>

                <div className="mz-pdp-grid">
                    <div className="mz-gallery" aria-label={`Zdjęcia: ${name}`}>
                        {images.map((src, index) => (
                            <figure key={src} className={isPackshot(src) ? "mz-pack" : undefined}>
                                <Image
                                    src={src}
                                    alt={`${name} — zdjęcie ${index + 1}`}
                                    fill
                                    sizes={GALLERY_SIZES}
                                    priority={index === 0}
                                    loading={index < 2 ? "eager" : "lazy"}
                                />
                            </figure>
                        ))}
                    </div>

                    <div className="mz-buy">
                        <div className="mz-eyebrow">
                            <span>Maison Carinii — Kolekcja 01</span>
                            <WishlistButton
                                variant="outline"
                                className="!size-9 !rounded-none !border-[#2a2a2a] !bg-transparent hover:!bg-[#141414]"
                                product={{ sku: product.sku, slug: product.slug, name: product.name }}
                            />
                        </div>

                        <div style={{ display: "grid", gap: 14 }}>
                            <h1 className="mz-title">{name}</h1>
                            {tagline && <p className="mz-tagline">{tagline}</p>}
                            <p className="mz-tagline" style={{ fontSize: 10, letterSpacing: "0.2em" }}>{product.sku}</p>
                        </div>

                        <div style={{ display: "grid", gap: 10 }}>
                            <div className="mz-price">
                                {onSale && <span className="mz-card-old">{formatMaisonPrice(Number(product.price))}</span>}
                                <span>{product.final_price ? formatMaisonPrice(Number(product.final_price)) : ""}</span>
                            </div>
                            {product.omnibus && (
                                <span className="mz-omnibus">
                                    Najniższa cena w ciągu ostatnich 30 dni: {formatMaisonPrice(Number(product.omnibus))}
                                </span>
                            )}
                        </div>

                        <PromoBadge product={product} />

                        <hr className="mz-rule" />

                        <div>
                            <SizeSwatch
                                theme="maison"
                                setVariant={setVariant}
                                size_qty={product.size_qty || []}
                                sku={product.sku}
                                image_thumbnail={product.image_main}
                            />
                        </div>

                        {!product.hide_price && (
                            <div>
                                {errorVariant && <p role="alert" className="mz-error">Wybierz rozmiar</p>}
                                <button type="button" className="mz-add" onClick={onAddToCart}>
                                    <ShoppingCart className="mr-3 inline size-4 align-[-3px]" aria-hidden="true" />
                                    Dodaj do koszyka
                                </button>
                                <div className="mz-secondary" style={{ marginTop: 12 }}>
                                    <PayButton tone="light" className="h-12" logos={<PayPoIcon className="h-6" />} onClick={onAddPaypo}>
                                        Kup i zapłać za 30 dni
                                    </PayButton>
                                    <ExpressCheckout getItems={getExpressItems} onBlockedClick={onBlockedClick} />
                                </div>
                            </div>
                        )}

                        <div className="mz-details">
                            {descriptionHtml && (
                                <details open>
                                    <summary>Opis</summary>
                                    <div className="mz-detail-body" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                                </details>
                            )}
                            {specEntries.length > 0 && (
                                <details>
                                    <summary>Specyfikacja</summary>
                                    <div className="mz-detail-body">
                                        <dl className="mz-spec">
                                            {specEntries.map(([label, value]) => (
                                                <div key={label} style={{ display: "contents" }}>
                                                    <dt>{label}</dt>
                                                    <dd>{value}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </div>
                                </details>
                            )}
                        </div>
                    </div>
                </div>

                {more.length > 0 && (
                    <section className="mz-pdp-more" aria-label="Z kolekcji Maison">
                        <div className="mz-more-h">
                            <h2>Z kolekcji Maison</h2>
                            <Link className="mz-cta" href={MAISON_PATHS.collection}>Zobacz wszystkie →</Link>
                        </div>
                        <div className="mz-list">
                            {more.map((item) => (
                                <MaisonProductCard key={item.sku} product={item} />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <section id="opinie" aria-label="Opinie klientów" className={reviewsEmpty ? "hidden" : "mz-reviews"}>
                <div className="mz-wrap" style={{ maxWidth: 1280, marginInline: "auto" }}>
                    <TrustmateWidget
                        key={`tm-hydra-${product.id}`}
                        token={TRUSTMATE_HYDRA_TOKEN}
                        productId={String(product.id ?? product.pid)}
                        lazy
                        minHeight={240}
                        onEmpty={onReviewsEmpty}
                    />
                </div>
            </section>
        </div>
    )
}
