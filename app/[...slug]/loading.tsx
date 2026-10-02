import { Spinner } from "@/components/ui/spinner";

// Instant skeleton pokazywany przez App Router w trakcie SSR docelowej
// strony (kategoria / produkt / CMS). Dzięki temu klik w link daje
// natychmiastowy feedback, a pasek postępu z RouteListener tylko
// uzupełnia go przy wolniejszych przejściach.
export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50" aria-busy="true" aria-label="Ładowanie strony">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-1 md:gap-6">
                    <aside className="hidden md:block w-64 flex-shrink-0">
                        <div className="flex flex-col gap-3">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-10 rounded-md bg-gray-200/70 animate-pulse" />
                            ))}
                        </div>
                    </aside>
                    <main className="flex-1">
                        <div className="h-8 w-1/3 rounded bg-gray-200/70 animate-pulse mb-4" />
                        <div className="h-4 w-1/4 rounded bg-gray-200/60 animate-pulse mb-6" />
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <div className="aspect-[2/3] rounded bg-gray-200/70 animate-pulse" />
                                    <div className="h-4 rounded bg-gray-200/60 animate-pulse" />
                                    <div className="h-4 w-2/3 rounded bg-gray-200/60 animate-pulse" />
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 flex justify-center">
                            <Spinner />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
