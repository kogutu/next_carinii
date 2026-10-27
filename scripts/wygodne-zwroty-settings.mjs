// Ustawienia sklepu w Wygodnych Zwrotach (Partner API): test klucza, podgląd i aktualizacja.
//
//   node --env-file=.env.local scripts/wygodne-zwroty-settings.mjs check
//   node --env-file=.env.local scripts/wygodne-zwroty-settings.mjs show
//   node --env-file=.env.local scripts/wygodne-zwroty-settings.mjs apply --webhook-url=https://sklep.carinii.com.pl/api/wygodnezwroty/webhook --yes
//
// Wymaga WYGODNE_ZWROTY_API_BASE_URL, WYGODNE_ZWROTY_API_KEY i WYGODNE_ZWROTY_MAILBOX_HID (patrz docs/wygodne-zwroty.md).
// `apply` zmienia ustawienia sklepu u dostawcy (adres zwrotów, adres webhooka), więc bez --yes tylko pokazuje, co wyśle.
// Klucza API nigdy nie wypisujemy.

const baseUrl = process.env.WYGODNE_ZWROTY_API_BASE_URL?.trim().replace(/\/+$/, '')
const apiKey = process.env.WYGODNE_ZWROTY_API_KEY?.trim()
const mailboxHid = process.env.WYGODNE_ZWROTY_MAILBOX_HID?.trim()

if (!baseUrl || !apiKey || !mailboxHid) {
    console.error('Brak WYGODNE_ZWROTY_API_BASE_URL, WYGODNE_ZWROTY_API_KEY lub WYGODNE_ZWROTY_MAILBOX_HID.')
    process.exit(1)
}

// Adres zwrotów: ten sam co w lib/withdrawal.ts (RETURN_ADDRESS) i docs/php/returns/_lib.php (RETURNS_ADDRESS)
const RETURN_ADDRESS = {
    name: 'Carinii – Magazyn',
    email: 'sklep@carinii.com.pl',
    phone: '+48 25 748 42 00',
    company: 'Z.P.O. CARINII',
    address: 'ul. Przemysłowa 40',
    postal_code: '08-410',
    city: 'Wola Rębkowska',
    country: 'PL',
}

const call = async (method, path, body) => {
    const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: { 'x-api-key': apiKey, Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
    })
    const json = await response.json().catch(() => null)
    return { status: response.status, json }
}

const [command, ...rest] = process.argv.slice(2)
const flag = (name) => rest.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3)

if (command === 'check') {
    const { status, json } = await call('GET', '/partner-api/v1/auth/check')
    console.log(status === 200 ? 'Klucz poprawny.' : `Klucz odrzucony (HTTP ${status}).`, status === 200 ? JSON.stringify(json?.data) : '')
} else if (command === 'show') {
    const { status, json } = await call('GET', `/partner-api/v1/shops/${mailboxHid}/settings`)
    console.log(`HTTP ${status}`)
    console.log(JSON.stringify(json, null, 2))
} else if (command === 'apply') {
    const webhookUrl = flag('webhook-url')
    const patch = { return_address: RETURN_ADDRESS, ...(webhookUrl ? { webhook_url: webhookUrl } : {}) }
    console.log('Zostanie wysłane (PATCH settings):')
    console.log(JSON.stringify(patch, null, 2))
    if (!rest.includes('--yes')) {
        console.log('\nNic nie wysłano. Dodaj --yes, aby zapisać zmiany u dostawcy.')
    } else {
        const { status, json } = await call('PATCH', `/partner-api/v1/shops/${mailboxHid}/settings`, patch)
        console.log(`HTTP ${status}`)
        console.log(JSON.stringify(json, null, 2))
    }
} else {
    console.error('Użycie: check | show | apply [--webhook-url=https://…] [--yes]')
    process.exit(1)
}
