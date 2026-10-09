// Wywołania skryptów PHP klienta (directseo/nextjs/user, /returns) — wyłącznie z serwera Next.js.
// Skrypty zakładają, że wołający jest zaufany (token), a identyfikator klienta pochodzi z sesji, nie z przeglądarki.

const CUSTOMER_API_URL = process.env.CUSTOMER_API_URL ?? 'https://sklep.carinii.com.pl/directseo/nextjs'

export type CustomerApiResult<T = any> = {
    ok: boolean
    status: number
    success: boolean
    message: string
    data: T | null
}

export async function customerApi<T = any>(
    path: string,
    body: Record<string, unknown>,
    init?: { formData?: FormData },
): Promise<CustomerApiResult<T>> {
    const token = process.env.CUSTOMER_API_TOKEN
    if (!token) throw new Error('Brak zmiennej CUSTOMER_API_TOKEN')

    const headers: Record<string, string> = { 'X-Api-Token': token, 'User-Agent': 'CariniiNext/1.0' }
    if (!init?.formData) headers['Content-Type'] = 'application/json'

    const response = await fetch(`${CUSTOMER_API_URL}/${path}`, {
        method: 'POST',
        headers,
        body: init?.formData ?? JSON.stringify(body),
        cache: 'no-store',
    })

    // Cloudflare lub błąd PHP mogą zwrócić HTML — traktujemy to jako błąd, nie jako dane
    const json = await response.json().catch(() => null)

    return {
        ok: response.ok,
        status: response.status,
        success: Boolean(json?.success),
        message: typeof json?.message === 'string' ? json.message : '',
        data: json?.data ?? null,
    }
}
