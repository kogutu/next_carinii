import { NextResponse, type NextRequest } from 'next/server'

// Wersja pokazowa na adresie *.vercel.app nie trafia do wyszukiwarek (nagłówek noindex). Docelowa domena
// sklepu (sklep.carinii.com.pl) nie jest ruszana — tam indeksowanie jest normalne.
export function proxy(request: NextRequest) {
    const response = NextResponse.next()
    const host = (request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.hostname).split(':')[0]
    if (host.endsWith('.vercel.app')) {
        response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    }
    return response
}

export const config = {
    // strony i API — bez plików statycznych i obrazów
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|avif|svg|ico|mp4|webm|woff2?)$).*)'],
}
