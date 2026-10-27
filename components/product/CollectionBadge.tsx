import { cn } from '@/lib/utils'

type CollectionBadgeProps = {
    // pola produktu z Typesense: nazwy kategorii i ich ID
    categories?: string[]
    cids?: Array<string | number>
    // widok siatki: pod serduszkiem ulubionych; widok listy: w rogu miniatury
    placement?: 'grid' | 'list'
}

const MAISON_CATEGORY_ID = '344'

type Collection = { name: string; src: string; className: string }

// Znaczki kolekcji pokazujemy na zdjęciu produktu — dokładnie te same grafiki, których używa sklep w Magento
const SIWIEC: Collection = { name: 'By Natalia Siwiec', src: '/kolekcje/siwiec.png', className: 'h-7' }
const PIECZONKA: Collection = { name: 'By Magda Pieczonka', src: '/kolekcje/pieczonka.png', className: 'h-7' }
const MAISON: Collection = { name: 'Maison Carinii', src: '/kolekcje/maison.png', className: 'h-8' }

const collectionsOf = (categories: string[], cids: string[]): Collection[] => {
    const found: Collection[] = []
    if (categories.includes(SIWIEC.name)) found.push(SIWIEC)
    if (categories.includes(PIECZONKA.name)) found.push(PIECZONKA)
    if (cids.includes(MAISON_CATEGORY_ID)) found.push(MAISON)
    return found
}

export default function CollectionBadge({ categories = [], cids = [], placement = 'grid' }: CollectionBadgeProps) {
    const collections = collectionsOf(categories, cids.map(String))
    if (collections.length === 0) return null

    return (
        <div className={cn('absolute z-10 flex flex-col items-end gap-1', placement === 'grid' ? 'right-2 top-11' : 'right-1.5 top-1.5')}>
            {collections.map((collection) => (
                // eslint-disable-next-line @next/next/no-img-element -- małe znaczki z public/, nie wymagają optymalizatora
                <img
                    key={collection.name}
                    src={collection.src}
                    alt={collection.name}
                    className={cn('w-auto bg-white/85 p-1', collection.className)}
                />
            ))}
        </div>
    )
}
