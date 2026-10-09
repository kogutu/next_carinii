import { X509Certificate, verify } from 'node:crypto'
import { getTpayConfig } from './config'

// Weryfikacja podpisu powiadomień Tpay (nagłówek X-JWS-Signature, RS256).
// Kroki wg dokumentacji: x5u musi wskazywać na secure.tpay.com, certyfikat musi być
// podpisany przez Tpay Root CA, a podpis liczony jest z HEADER + "." + base64url(surowe ciało).

const CERT_TTL_MS = 60 * 60 * 1000

type PemFetcher = (url: string) => Promise<string>

const certCache = new Map<string, { cert: X509Certificate; expiresAt: number }>()

const defaultFetchPem: PemFetcher = async (url) => {
    const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(10000) })
    if (!res.ok) throw new Error(`Nie udało się pobrać certyfikatu: ${res.status}`)
    return res.text()
}

const fromBase64Url = (value: string): Buffer =>
    Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64')

const toBase64Url = (buffer: Buffer): string =>
    buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const loadCertificate = async (url: string, fetchPem: PemFetcher): Promise<X509Certificate> => {
    const cached = certCache.get(url)
    if (cached && Date.now() < cached.expiresAt) return cached.cert

    const cert = new X509Certificate(await fetchPem(url))
    certCache.set(url, { cert, expiresAt: Date.now() + CERT_TTL_MS })
    return cert
}

const isWithinValidity = (cert: X509Certificate): boolean => {
    const now = Date.now()
    return now >= new Date(cert.validFrom).getTime() && now <= new Date(cert.validTo).getTime()
}

type VerifyOptions = {
    secureUrl?: string
    fetchPem?: PemFetcher
}

export const verifyTpayNotification = async (
    rawBody: string,
    jwsHeader: string | null,
    { secureUrl = getTpayConfig().secureUrl, fetchPem = defaultFetchPem }: VerifyOptions = {},
): Promise<boolean> => {
    if (!jwsHeader) return false

    const [headerB64, , signatureB64] = jwsHeader.split('.')
    if (!headerB64 || !signatureB64) return false

    try {
        const header = JSON.parse(fromBase64Url(headerB64).toString('utf8'))
        const x5u: unknown = header?.x5u
        if (typeof x5u !== 'string' || !x5u.startsWith(`${secureUrl}/`)) return false

        const [leaf, root] = await Promise.all([
            loadCertificate(x5u, fetchPem),
            loadCertificate(`${secureUrl}/x509/tpay-jws-root.pem`, fetchPem),
        ])

        // łańcuch zaufania: certyfikat podpisany przez Tpay Root CA, oba w okresie ważności
        if (!isWithinValidity(leaf) || !isWithinValidity(root)) return false
        if (!leaf.verify(root.publicKey)) return false

        const signingInput = Buffer.from(`${headerB64}.${toBase64Url(Buffer.from(rawBody, 'utf8'))}`)
        return verify('RSA-SHA256', signingInput, leaf.publicKey, fromBase64Url(signatureB64))
    } catch (error) {
        console.error('[tpay] JWS verification failed:', error)
        return false
    }
}

export const clearTpayCertificateCache = () => certCache.clear()
