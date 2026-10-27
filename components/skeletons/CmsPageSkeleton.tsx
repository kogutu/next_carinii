import { cn } from '@/lib/utils'

const block = 'bg-gray-200/70 animate-pulse motion-reduce:animate-none'
const soft = 'bg-gray-200/60 animate-pulse motion-reduce:animate-none'

// Szkielet strony tekstowej (CMS): nagłówek i kilka akapitów.
export default function CmsPageSkeleton() {
    return (
        <main className="mx-auto max-w-4xl px-4 py-10" aria-busy="true" aria-label="Ładowanie strony">
            <div className={cn('mb-8 h-9 w-1/2 rounded', block)} />
            <div className="space-y-6">
                {[0, 1, 2].map((paragraph) => (
                    <div key={paragraph} className="space-y-2.5">
                        <div className={cn('h-4 w-full rounded', soft)} />
                        <div className={cn('h-4 w-11/12 rounded', soft)} />
                        <div className={cn('h-4 w-4/5 rounded', soft)} />
                    </div>
                ))}
            </div>
        </main>
    )
}
