import { cn } from '@/lib/utils'

const block = 'bg-gray-200/70 animate-pulse motion-reduce:animate-none'
const soft = 'bg-gray-200/60 animate-pulse motion-reduce:animate-none'

// Karta jak prawdziwa karta produktu w siatce: zdjęcie 2:3, rząd rozmiarów, nazwa, SKU i cena (wyśrodkowane).
function CardSkeleton() {
    return (
        <div className="flex flex-col">
            <div className={cn('aspect-[2/3] w-full', block)} />
            <div className="flex flex-col items-center gap-1.5 px-3 pb-2 pt-2.5">
                <div className="flex justify-center gap-[2px]">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className={cn('h-[26px] w-7', soft)} />
                    ))}
                </div>
                <div className={cn('mt-2 h-4 w-4/5 rounded', soft)} />
                <div className={cn('h-3 w-1/2 rounded', soft)} />
                <div className={cn('mt-1 h-4 w-1/3 rounded', block)} />
            </div>
        </div>
    )
}

// Szkielet kategorii: filtry po lewej (od md), nagłówek, pasek sortowania i siatka 2/4 kolumn — jak w pages/category/category-page.tsx.
export default function CategoryPageSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50" aria-busy="true" aria-label="Ładowanie kategorii">
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="flex flex-col gap-1 md:flex-row md:gap-6">
                    <div className="mb-4 flex items-center justify-between md:hidden">
                        <div className={cn('h-7 w-1/2 rounded', block)} />
                        <div className={cn('h-9 w-24 rounded-md', block)} />
                    </div>

                    <aside className="hidden w-64 flex-shrink-0 md:block">
                        <div className="flex flex-col gap-6">
                            {[5, 4, 6].map((rows, group) => (
                                <div key={group} className="flex flex-col gap-3">
                                    <div className={cn('h-4 w-1/2 rounded', block)} />
                                    {Array.from({ length: rows }).map((_, i) => (
                                        <div key={i} className={cn('h-4 w-3/4 rounded', soft)} />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </aside>

                    <main className="w-full flex-1 md:w-auto">
                        <div className="mb-6 hidden md:block">
                            <div className={cn('h-9 w-1/3 rounded', block)} />
                            <div className={cn('mt-3 h-4 w-2/3 rounded', soft)} />
                        </div>
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <div className={cn('h-5 w-28 rounded', soft)} />
                            <div className="flex gap-2">
                                <div className={cn('h-9 w-32 rounded-md', block)} />
                                <div className={cn('hidden h-9 w-24 rounded-md sm:block', block)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <CardSkeleton key={i} />
                            ))}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
