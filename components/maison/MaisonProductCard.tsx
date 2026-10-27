import Image from "next/image"
import Link from "next/link"
import { formatMaisonPrice, type MaisonProduct } from "@/lib/maisonShared"

type MaisonProductCardProps = {
    product: MaisonProduct
    // pierwsze karty nad zgięciem ładują się od razu
    priority?: boolean
}

const IMAGE_SIZES = "(min-width: 1900px) 20vw, (min-width: 1100px) 25vw, (min-width: 760px) 33vw, 50vw"

export default function MaisonProductCard({ product, priority = false }: MaisonProductCardProps) {
    const href = `/${product.slug}`
    const hasHover = product.imageHover && product.imageHover !== product.image
    const lastPieces = product.sizes.filter((size) => size.qty > 0 && size.qty < 2).length

    return (
        <article className="mz-card">
            <Link className="mz-card-media" href={href} aria-label={product.name}>
                <Image
                    src={product.image || "/placeholder.jpg"}
                    alt={product.name}
                    fill
                    sizes={IMAGE_SIZES}
                    priority={priority}
                />
                {hasHover && <Image src={product.imageHover} alt="" fill sizes={IMAGE_SIZES} />}
                {product.isNew && <span className="mz-card-flag">Nowość</span>}
            </Link>
            <div className="mz-card-body">
                <div className="mz-card-row">
                    <Link className="mz-card-name" href={href}>{product.name}</Link>
                    <span className="mz-card-price">
                        {product.specialPrice !== null && <span className="mz-card-old">{formatMaisonPrice(product.price)}</span>}
                        <span>{formatMaisonPrice(product.specialPrice ?? product.price)}</span>
                    </span>
                </div>
                {product.sizes.length > 0 && (
                    <ul className="mz-sizes" aria-label="Rozmiary">
                        {product.sizes.map((size) => (
                            <li
                                key={size.size}
                                className={size.qty > 0 ? undefined : "off"}
                                title={size.qty > 0 ? `Rozmiar ${size.size}` : `Rozmiar ${size.size} niedostępny`}
                            >
                                {size.size}
                            </li>
                        ))}
                    </ul>
                )}
                {lastPieces > 2 && <p className="mz-card-note">Ostatnie sztuki</p>}
            </div>
        </article>
    )
}
