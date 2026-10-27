import { cn } from '@/lib/utils'

const block = 'bg-gray-200/70 animate-pulse motion-reduce:animate-none'

// Szkielet strony produktu: te same wymiary, co prawdziwa strona (galeria po lewej, kolumna 350 px po prawej),
// żeby po załadowaniu treść nie przeskakiwała.
export default function ProductPageSkeleton() {
    return (
        <main className="min-h-screen py-8" aria-busy="true" aria-label="Ładowanie produktu">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
                    {/* galeria: na desktopie siatka 2 kolumn, na telefonie jedno zdjęcie na całą szerokość */}
                    <div>
                        <div className={cn('aspect-[2/3] w-full rounded lg:hidden', block)} />
                        <div className="hidden grid-cols-2 gap-2 lg:grid">
                            {[0, 1, 2, 3].map((i) => (
                                <div key={i} className={cn('aspect-[2/3] rounded', block)} />
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="space-y-3">
                            <div className="flex justify-end gap-2">
                                <div className={cn('size-10 rounded-full', block)} />
                                <div className={cn('size-10 rounded-full', block)} />
                            </div>
                            <div className={cn('h-4 w-32 rounded', block)} />
                            <div className={cn('h-8 w-4/5 rounded', block)} />
                            <div className={cn('h-4 w-1/3 rounded', block)} />
                        </div>

                        <div className="space-y-3">
                            <div className={cn('h-4 w-24 rounded', block)} />
                            <div className={cn('h-10 w-1/2 rounded', block)} />
                        </div>

                        <div>
                            <div className={cn('mb-4 h-4 w-40 rounded', block)} />
                            <div className="grid grid-cols-4 gap-2.5 md:grid-cols-5 lg:grid-cols-6">
                                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className={cn('h-12', block)} />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className={cn('h-12 w-full rounded-xl', block)} />
                            <div className={cn('h-12 w-full rounded-xl', block)} />
                            <div className={cn('h-11 w-full rounded-xl', block)} />
                            <div className={cn('h-11 w-full rounded-xl', block)} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
