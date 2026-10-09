import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getTpayConfig } from '@/lib/tpay/config'

const ONE_DAY_SECONDS = 24 * 60 * 60

// Własny plik (np. pobrany z developer.apple.com, jeśli Tpay tak zaleci) — ma pierwszeństwo przed plikiem Tpay.
const LOCAL_FILE = path.join(process.cwd(), 'data', 'apple-pay', 'apple-developer-merchantid-domain-association')

const textResponse = (body: string, status = 200) =>
    new Response(body, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })

const readLocalFile = async (): Promise<string | null> => {
    try {
        return await readFile(LOCAL_FILE, 'utf8')
    } catch {
        return null
    }
}

// Apple Pay (web) wymaga pliku domeny pod /.well-known/apple-developer-merchantid-domain-association
// — publicznie, bez autoryzacji i bez przekierowań. Domyślnie serwujemy plik pobierany z Tpay
// (wg dokumentacji Tpay: https://secure.tpay.com/.well-known/...), cache'owany 24 h.
export async function GET() {
    const local = await readLocalFile()
    if (local) return textResponse(local)

    const { secureUrl } = getTpayConfig()

    try {
        const res = await fetch(`${secureUrl}/.well-known/apple-developer-merchantid-domain-association`, {
            next: { revalidate: ONE_DAY_SECONDS },
            signal: AbortSignal.timeout(10000),
        })
        if (!res.ok) throw new Error(`status ${res.status}`)

        return textResponse(await res.text())
    } catch (error) {
        console.error('[tpay] apple-pay domain association unavailable:', error)
        return textResponse('Unavailable', 502)
    }
}
