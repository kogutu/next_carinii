# Vercel: zmienne środowiskowe do testów płatności

Aplikacja: <https://next-carinii-81mq.vercel.app> (wdrożenie z `main`). Zmienne ustawia się w
**Vercel → Project → Settings → Environment Variables** (środowisko *Production*, ewentualnie też *Preview*).
Zmiana zmiennych działa dopiero po **ponownym wdrożeniu** (Deployments → ⋯ → Redeploy).
Wartości sekretów bierz z lokalnego `.env` / paneli dostawców — nie wklejaj ich do repozytorium ani na czat.

## 1. Adresy aplikacji (inne niż lokalnie)

| Zmienna | Wartość na Vercelu | Po co |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://next-carinii-81mq.vercel.app` | adresy powrotu i webhooków Tpay / P24 (musi być publiczny, HTTPS) |
| `NEXT_PUBLIC_API_URL` | `https://next-carinii-81mq.vercel.app` | strona zamówienia pobiera zamówienie z własnego `/api/orders` |
| `NEXTAUTH_URL` | `https://next-carinii-81mq.vercel.app` | logowanie (NextAuth) |
| `NEXTAUTH_SECRET`, `AUTH_SECRET` | jak lokalnie | sesje |

Logowanie przez Google / Apple / Facebook wymaga dodania adresu `https://next-carinii-81mq.vercel.app/api/auth/callback/<dostawca>`
w konsolach tych dostawców (`GOOGLE_CLIENT_ID/SECRET`, `APPLE_ID/SECRET`, `FACEBOOK_CLIENT_ID/SECRET` jak lokalnie).

## 2. Wybór metod płatności (widoczne w koszyku i na stronie zamówienia)

Domyślnie (bez żadnej zmiennej) widoczne są: Blik, Płatność kartą, PayPo, Przelew tradycyjny, Przelewy24, Tpay.
Do testów ustaw:

| Zmienna | Wartość | Skutek |
|---|---|---|
| `NEXT_PUBLIC_PAY_GOOGLEPAY` | `p24` | Google Pay na stronie przez Przelewy24 (przycisk w „Płatność kartą”, szybka płatność na karcie produktu) |
| `NEXT_PUBLIC_PAY_APPLEPAY_MODE` | `redirect` | Apple Pay przez panel Tpay — domena Vercela nie jest (jeszcze) zarejestrowana w Apple/Tpay, więc `onsite` na niej nie zadziała |
| `NEXT_PUBLIC_PAY_EXPRESS` | `on` (domyślnie) | przyciski „lub kup od razu” na karcie produktu i w mini-koszyku |

Pozostałe `NEXT_PUBLIC_PAY_*` zostają domyślne — opis w `.env.example` i `docs/tpay-integration.md`.

## 3. Tpay (sandbox)

| Zmienna | Wartość |
|---|---|
| `NEXT_PUBLIC_TPAY_ENV` | `sandbox` |
| `TPAY_CLIENT_ID`, `TPAY_CLIENT_SECRET` | klucze Open API z `panel.sandbox.tpay.com` → Integracje → API |
| `NEXT_PUBLIC_APPLE_MERCHANT_ID`, `APPLE_PAY_DOMAIN` | opcjonalnie, dopiero przy Apple Pay `onsite` (domena = adres Vercela, zarejestrowany w Apple i Tpay) |

W panelu Tpay (sandbox): adres powiadomień `https://next-carinii-81mq.vercel.app/api/tpay/notification` oraz opcja „Zezwól na nadpisanie”.

## 4. Przelewy24 (sandbox)

| Zmienna | Wartość |
|---|---|
| `NEXT_PUBLIC_P24_MERCHANT_ID` | id sprzedawcy P24 (sandbox: `94695`; w lokalnym `.env.local`) |
| `P24_SANDBOX` | `true` |
| `P24_SANDBOX_CRC_KEY`, `P24_SANDBOX_API_KEY`, `P24_SANDBOX_MERCHANT_NAME` | jak lokalnie |
| `P24_POS_ID`, `P24_CRC_KEY`, `P24_API_KEY`, `P24_MERCHANT_NAME`, `P24_URLSTATUS` | jak lokalnie (używane przy `P24_SANDBOX` ≠ `true` i przez starsze przyciski) |
| `P24_GOOGLEPAY_METHOD_ID` | opcjonalnie; domyślnie `266` |

Powiadomienia P24 idą na `…/api/p24/notification` (adres wysyłany w każdej transakcji — nic nie trzeba ustawiać w panelu).

## 5. Oznaczanie zamówień jako opłaconych w Magento

| Zmienna | Wartość |
|---|---|
| `ORDER_MARK_PAID_URL` | `https://sklep.carinii.com.pl/directseo/nextjs/orders/markPaid.php` |
| `ORDER_MARK_PAID_TOKEN` | token z lokalnego `.env` (ten sam, co `mark_paid_token` na serwerze) |
| `ORDER_MARK_PAID_DRY_RUN` | `1` na czas testów (nic nie księguje w produkcyjnym Magento); **usuń**, gdy chcesz księgować naprawdę |

## 6. Pozostałe zmienne z lokalnego `.env`

`PAYU_CLIENT_ID`, `PAYU_CLIENT_SECRET`, `PAYU_MERCHANT_POS_ID`, `PAYU_SECOND_KEY`, `PAYU_ENVIRONMENT` — jak lokalnie
(tylko dla starego PayPo przez PayU; domyślnie PayPo idzie przez Tpay, więc do testów nie są potrzebne).

## 7. Szybka kontrola po wdrożeniu

- `https://next-carinii-81mq.vercel.app/api/p24/gpay/config` → JSON z `merchantId` i `environment: TEST` (sandbox).
- `https://next-carinii-81mq.vercel.app/api/tpay/status?oid=H-1` → JSON `{"error":"Brak parametrów"}` (trasa istnieje; bez wdrożenia: „Bad request.”).
- Koszyk (`/checkout`): w „Metoda płatności” widać Blik, Płatność kartą (z plakietkami), PayPo, Przelew, Przelewy24, Tpay.
- Zamówienia testowe trafiają do produkcyjnego Magento (`createOrder.php`) — używaj własnego e-maila i anuluj je po teście.
