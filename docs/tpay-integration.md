# Płatności Tpay — wdrożenie i konfiguracja

Tpay obsługuje: BLIK (Level 0, kod na stronie), kartę (przekierowanie), Google Pay i Apple Pay (na stronie),
PayPo (przekierowanie) oraz ogólne „Tpay” (przekierowanie do panelu). Przelewy24 zostaje jako zwykłe przekierowanie.

## Wybór metod przez `.env`

Wzór: `.env.example`. Zmienne `NEXT_PUBLIC_*` są wbudowywane w bundle, więc **po zmianie trzeba przebudować/zrestartować aplikację**.

| Zmienna | Wartości | Domyślnie | Skutek |
|---|---|---|---|
| `NEXT_PUBLIC_PAY_BLIK` | `tpay` / `p24` / `off` | `tpay` | `tpay` → opcja „Blik” (Tpay), `p24` → stary BLIK przez Przelewy24 (`devbackblik`) |
| `NEXT_PUBLIC_PAY_GOOGLEPAY` | `tpay` / `p24` / `off` | `tpay` | `tpay` → przycisk w „Płatność kartą”, `p24` → osobna opcja „Google payments” (`carinii_sklep`) |
| `NEXT_PUBLIC_PAY_CARD` | `tpay` / `off` | `tpay` | przycisk „Zapłać kartą” (przekierowanie do Tpay) |
| `NEXT_PUBLIC_PAY_APPLEPAY` | `tpay` / `off` | `tpay` | przycisk Apple Pay (tylko Safari/Apple) |
| `NEXT_PUBLIC_PAY_GOOGLEPAY_MODE` | `redirect` / `onsite` | `redirect` | `redirect` → przycisk przenosi do panelu Tpay (każdy agent), `onsite` → przycisk Google na naszej stronie (tylko agent Pekao) |
| `NEXT_PUBLIC_PAY_APPLEPAY_MODE` | `redirect` / `onsite` | `redirect` | jak wyżej; `onsite` włączaj po potwierdzeniu w Tpay (sandbox używa Pekao, więc go nie zweryfikuje) |
| `NEXT_PUBLIC_PAY_PAYPO` | `tpay` / `payu` / `off` | `tpay` | PayPo przez Tpay albo dotychczasowe PayU |
| `NEXT_PUBLIC_PAY_P24` | `on` / `off` | `on` | opcja „Przelewy24” |
| `NEXT_PUBLIC_PAY_TPAY` | `on` / `off` | `on` | opcja „Tpay” |
| `NEXT_PUBLIC_PAY_PAYU` | `on` / `off` | `off` | stara opcja „Payu” (nie ma dla niej przycisku płatności) |

Opcja „Płatność kartą” (`tpay_card`) pokazuje się, gdy włączone jest którekolwiek z: karta / Google Pay / Apple Pay.
Metody wyłączone w `.env` znikają z koszyka i z listy „Zmień metodę płatności”, ale **istniejące zamówienia** z takim
kodem nadal pokazują swój przycisk płatności.

## Dane dostępowe i środowisko

- `NEXT_PUBLIC_TPAY_ENV` = `sandbox` (domyślnie) lub `production`. Sandbox: `openapi.sandbox.tpay.com`, produkcja: `api.tpay.com`.
- `TPAY_CLIENT_ID`, `TPAY_CLIENT_SECRET` — Panel Akceptanta → Integracja → API → Klucze do Open API (hasło widać tylko przy tworzeniu klucza).
- `NEXT_PUBLIC_TPAY_MERCHANT_ID` — tylko tryb `onsite`: identyfikator sprzedawcy używany jako `gatewayMerchantId` w Google Pay. Bez niego przycisk Google Pay on-site jest ukryty.
- `NEXT_PUBLIC_GOOGLE_MERCHANT_ID` — tylko tryb `onsite`: z Google Pay & Wallet Console, wymagany na produkcji.
- `NEXT_PUBLIC_APP_URL` — publiczny adres sklepu; z niego budowane są adres webhooka i adresy powrotu.
- `TPAY_PAYPO_CHANNEL_ID` — opcjonalnie; domyślnie id kanału PayPo jest wyszukiwane po nazwie w `GET /transactions/channels`.

## Gdzie klient widzi Google Pay i Apple Pay

1. **Koszyk — szybka płatność** (pod „Złóż zamówienie”, sekcja „lub zapłać od razu”): przycisk **Google Pay** (zawsze, gdy włączony)
   i **Apple Pay** (tylko Safari / urządzenia Apple). Klik waliduje formularz, składa zamówienie z metodą „Płatność kartą”
   i od razu przekierowuje do panelu Tpay (`/api/tpay/create`, `googlepay` / `applepay`). Ukryte przy kurierze za pobraniem.
2. **Strona zamówienia** (po złożeniu, pod „Płatność kartą”): „Zapłać kartą”, Google Pay (przekierowanie lub przycisk Google w trybie `onsite`)
   i Apple Pay (przycisk Apple z SDK, tryb `onsite`). Gdy Apple Pay jest niedostępny, pokazuje się komunikat z powodem.
3. **Plakietki** VISA / Mastercard / Google Pay / Apple Pay przy opcji „Płatność kartą” na liście metod.

**Apple Pay na stronie wymaga HTTPS.** Apple Pay JS odmawia działania na `http://localhost` („insecure document”), więc lokalnie
przycisku nie zobaczysz — testuj pod `https://sklep.carinii.com.pl` (albo przez tunel HTTPS). Ładujemy oficjalny SDK Apple
(`apple-pay-sdk.js`), który dodaje Apple Pay także w Chrome/Edge/Firefox (płatność kodem QR skanowanym iPhonem z iOS 18+).
Przycisk jest ukrywany tylko, gdy Apple zgłosi `applePayUnsupported` (zgodnie z dokumentacją Tpay) — zależy to od
przeglądarki i urządzenia; `NEXT_PUBLIC_APPLE_MERCHANT_ID` (np. `merchant.carnii`) służy do tego sprawdzenia i do walidacji przez QR.

## Google Pay przez Przelewy24 (on-site) i szybka płatność

Tpay oferuje Google Pay on-site tylko dla agenta Pekao (umowa jest z Elavon), więc Google Pay na stronie idzie przez **Przelewy24**:
`NEXT_PUBLIC_PAY_GOOGLEPAY=p24`. Przycisk jest wtedy częścią opcji „Płatność kartą” (osobna opcja `carinii_sklep` jest ukryta).

**Przepływ P24:** token z Google Pay (`gateway: przelewy24`, `gatewayMerchantId` = id sprzedawcy P24) → `POST /api/p24/gpay/register`
(kwota i e-mail z zamówienia; id metody z `P24_GOOGLEPAY_METHOD_ID`, domyślnie 266) → skrypt `…/bundle/payWithGoogle/{TOKEN}` i `charge()` →
3DS wraca na `…/success/oid/<numer>?payment=p24` → powiadomienie P24 `POST /api/p24/notification` (podpis SHA-384, `PUT /transaction/verify`)
→ `markPaid.php` z `provider: p24`. Konfiguracja P24 z istniejących zmiennych (`NEXT_PUBLIC_P24_MERCHANT_ID`, `P24_POS_ID`, `P24_CRC_KEY`,
`P24_API_KEY`, `P24_SANDBOX`, `P24_SANDBOX_*`); przeglądarka pobiera jawne dane z `GET /api/p24/gpay/config`.
Na produkcji potrzebne: domena w Google Pay & Wallet Console i `NEXT_PUBLIC_GOOGLE_MERCHANT_ID`.

**Szybka płatność** (`NEXT_PUBLIC_PAY_EXPRESS=on`): sekcja „lub kup od razu” na karcie produktu (pod PayPo, wymaga wyboru rozmiaru) i w mini-koszyku
(pod „Przejdź do Kasy”, cały koszyk z kuponem). Okno portfela zbiera e-mail, telefon i adres (tylko Polska), klient wybiera kuriera
(DHL24 / InPost Kurier z `data/shipping_payment_methods.json`; bez paczkomatów i pobrania). Po autoryzacji powstaje zamówienie
(`tpay_card`, paragon, notatka „Szybka płatność: …”), potem płatność: **Apple Pay przez Tpay** (`/api/tpay/wallet`), **Google Pay przez P24**
(`/api/p24/gpay/register`). Kwota zatwierdzona w oknie (`expectedAmount`) jest porównywana z kwotą zamówienia w Magento — rozjazd >0,01 zł
kończy się odmową (409), a klient dokańcza płatność na stronie zamówienia. Nieudana płatność zostawia zamówienie „nieopłacone”.
Pliki: `components/express/*`, `lib/express/*`, `components/p24/P24GooglePayButton.tsx`, `lib/p24/*`.

## Co trzeba ustawić po stronie Tpay

1. **Powiadomienia:** adres `https://<sklep>/api/tpay/notification`. Aplikacja podaje go też w każdej transakcji
   (`callbacks.notification.url`), co działa tylko przy włączonej w panelu opcji „Zezwól na nadpisanie”.
   Adres musi być publiczny, HTTPS, bez przekierowań (301/302 nie są obsługiwane).
2. **Apple Pay (web, tryb `onsite`):** dodać domenę w Panelu → Integracje → Apple Pay (domena musi być wcześniej dodana w „Punkt sprzedaży”).
   Plik weryfikacyjny jest serwowany przez aplikację pod
   `/.well-known/apple-developer-merchantid-domain-association` (domyślnie pobierany z Tpay — wg dokumentacji API Tpay
   z `https://secure.tpay.com/.well-known/...` — i cache’owany 24 h).
   **Uwaga:** panel Tpay (Integracje → Apple Pay) pisze o pobraniu pliku z `developer.apple.com`, a dokumentacja API o pliku z Tpay.
   Jeśli Tpay potwierdzi, że potrzebny jest plik od Apple, zapisz go jako
   `data/apple-pay/apple-developer-merchantid-domain-association` — jeśli taki plik istnieje, ma pierwszeństwo przed plikiem Tpay.
   Domeny dodawane w panelu muszą być wcześniej zarejestrowane na koncie (Twoje konto → Moje konto → Punkty Sprzedaży),
   a subdomeny muszą pochodzić z domeny głównej podanej przy rejestracji konta.
3. **Google Pay:** w trybie `redirect` (domyślny) nie trzeba nic rejestrować w Google. Google Pay „na stronie” (token, tryb `onsite`)
   jest wg dokumentacji Tpay dostępne tylko dla agenta rozliczeniowego **Pekao**; przy Elavonie używamy przekierowania.
   W trybie `onsite` dodatkowo: domena w Google Pay & Wallet Console i `NEXT_PUBLIC_GOOGLE_MERCHANT_ID` na produkcji.
4. Karta: Tpay obsługuje tylko Visa i Mastercard. Płatność kartą jest przekierowaniem do panelu Tpay (bez PCI DSS po naszej stronie).

## Kody metod płatności a Magento (zrobione po stronie PHP)

Magento przyjmuje tylko zarejestrowane metody płatności (aktywne dziś: `purchaseorder`, `banktransfer`, `cashondelivery`,
`paypal_express`, `devbackblik`, `dialcom_przelewy`, `tpay`). Aplikacja rozróżnia więcej opcji, więc w PHP działa warstwa
mapowania (`payment/codes.php`): do Magento idzie metoda zarejestrowana, a „prawdziwy” kod aplikacji i tytuł są zapisywane
w `additional_information` płatności (`app_payment_code`, `method_title`) i zwracane przez `orders/index.php`
jako `paymentMethodCode` / `paymentMethod`.

| Kod w aplikacji | Metoda w Magento | Tytuł |
|---|---|---|
| `tpay_blik` | `devbackblik` | Blik |
| `tpay_card` | `tpay` | Płatność kartą |
| `tpay` | `tpay` | Tpay.com |
| `dialcom_przelewy` | `dialcom_przelewy` | Przelewy24 |
| `purchaseorder` | `purchaseorder` | PayPo |
| `devbackblik`, `carinii_sklep` | bez zmian | BLIK / Google payments przez P24 (tylko gdy `*_BLIK`/`*_GOOGLEPAY` = `p24`) |

Nowy alias dopisuje się w `nextPaymentAliases()` w `payment/codes.php` (bez zmian w Magento).
`createOrder.php` zapisuje też typ dokumentu (`documentType`: `receipt`/`invoice`) — przy fakturze dodaje wpis w historii
zamówienia („Klient chce fakturę VAT (NIP: …)” albo „osoba prywatna, bez NIP”), a `orders/index.php` zwraca pole `documentType`.

Reguły dostępności (jak dotąd): wszystkie metody online są niedostępne przy wysyłce `flatrate48_flatrate48` (kurier za pobraniem).

## Skrypty PHP na serwerze

Katalog: `web-01.carinii.cloud.stpl.net.pl:/home/directseo/domains/sklep.carinii.com.pl/public_html/directseo/nextjs`
Kopie w repozytorium: `docs/php/` (bez plików z danymi dostępowymi).

| Plik | Status | Opis |
|---|---|---|
| `orders/markPaid.php` | nowy | oznacza zamówienie jako opłacone (kontrakt niżej) |
| `payment/codes.php` | nowy | mapowanie kodów aplikacji na metody Magento |
| `payment/config.local.php` | nowy, tylko na serwerze | token `mark_paid_token` + dane bazy `payment_callbacks`; wzór: `docs/php/payment/config.local.example.php` |
| `/home/directseo/logs/markPaid.log` | tworzony automatycznie, **poza** `public_html` | log (ostrzeżenia: nieautoryzowane żądania, podwójne płatności, płatność za anulowane zamówienie). Serwer to nginx, więc `.htaccess` nie działa i pliki w `public_html` są dostępne przez HTTP |
| `orders/createOrder.php` | zmieniony | mapowanie kodów, `documentType`, wpis o fakturze (diff: `docs/php/patches/createOrder.php.diff`) |
| `orders/index.php` | zmieniony | `paymentMethodCode` z aplikacji + `documentType` (diff: `docs/php/patches/index.php.diff`) |
| `orders/cpay.php` | zmieniony | zmiana metody płatności z obsługą aliasów (diff: `docs/php/patches/cpay.php.diff`) |

Kopie zapasowe zmienionych plików: `*.php.bak-20261008` obok oryginałów (powrót = podmiana pliku kopią).

**Uwaga: cache po stronie serwera.** Odpowiedzi `orders/index.php?oid=…` bywają cache’owane per adres. Aplikacja dopisuje
dlatego parametr `&_=<timestamp>` przy odczycie zamówienia (strona zamówienia i sprawdzanie statusu płatności).

## Kontrakt `orders/markPaid.php`

Aplikacja (webhook Tpay i odpytywanie statusu) woła `ORDER_MARK_PAID_URL`:

```
POST https://sklep.carinii.com.pl/directseo/nextjs/orders/markPaid.php
Authorization: Bearer {ORDER_MARK_PAID_TOKEN}      (token = mark_paid_token z payment/config.local.php)
Content-Type: application/json

{
  "oid": "H-1790000000000",       // numer zamówienia (increment_id)
  "provider": "tpay",
  "transactionId": "TR-XXXX-XXXX",
  "amount": 549.00,                // faktycznie zapłacona kwota
  "currency": "PLN",
  "paidAt": "2026-10-08T10:15:00.000Z",
  "testMode": false
}
```

Odpowiedź: HTTP 200 i `{"success": true}`; inne kody oznaczają, że Tpay ponowi powiadomienie (do 37 prób).

Co robi skrypt (w tej kolejności):

1. Weryfikuje token, dane wejściowe, istnienie zamówienia, że nie jest anulowane (409 `order_canceled`) i że kwota ≥ wartość zamówienia (409).
2. **Flaga płatności:** wiersz w `payment_callbacks` (jeden na `oid`) ze statusem `success` — tak `orders/index.php` ustala pole `pay`.
3. **Magento** — jak moduł `Tpay_Tpay` po powiadomieniu: faktura (capture online) z mailem, mail z zamówieniem (jeśli jeszcze nie wysłany),
   `zaplacono = 1`, status `processing` i wpis w historii zamówienia.

Idempotencja: ten sam `transactionId` → 200 bez ponownego księgowania. Jeśli krok 3 się nie powiódł, odpowiedź to 500 (Tpay ponowi),
a kolejne wywołanie powtórzy tylko krok 3. Zamówienie opłacone inną transakcją → 200 `alreadyPaid` i wpis „DOUBLE PAYMENT” w logu.

Tryby pomocnicze (bez zapisu): `{"ping": true}` — test tokenu i połączenia z bazą; `"dryRun": true` — pełna walidacja i
odpowiedź „co by się stało” (`action`: `insert`/`update`/`duplicate`/`alreadyPaid` + stan zamówienia w Magento).

## Przepływ płatności

1. Checkout → zamówienie w Magento → strona `/success/oid/<numer>` z przyciskami płatności dla wybranej metody.
2. **BLIK:** klient wpisuje kod → `POST /api/tpay/create` (`pay.groupId 150`, `blikToken`) → odpytywanie `GET /api/tpay/status`.
3. **Karta / Tpay / PayPo:** `POST /api/tpay/create` → przekierowanie na `transactionPaymentUrl` → powrót na stronę zamówienia
   z `?payment=tpay&result=success|error` (strona dopytuje o status do ~60 s).
4. **Google Pay / Apple Pay, tryb `redirect` (domyślny):** `POST /api/tpay/create` (`groupId` 166 / `channelId` 75) → przekierowanie do panelu Tpay.
   Przycisk Apple Pay pokazuje się tylko w Safari / na urządzeniach Apple.
   **Tryb `onsite`:** token z przeglądarki → `POST /api/tpay/wallet` (tworzy i opłaca transakcję; przy 3DS zwraca `redirectUrl`).
5. **Webhook** `POST /api/tpay/notification`: weryfikacja podpisu JWS (`X-JWS-Signature`, certyfikat z `secure(.sandbox).tpay.com`
   podpisany przez Tpay Root CA), odpowiedź `TRUE`. Płatność testowa na produkcji jest ignorowana. Status `chargeback` jest tylko logowany.

## Testowanie

Uwaga: `createOrder.php` zapisuje zamówienia w **produkcyjnym Magento** sklepu — każdy test z „Złóż zamówienie” tworzy prawdziwe
zamówienie. Używaj własnego e-maila i komentarza „TEST”, a po teście anuluj zamówienie.

1. **Bez księgowania (bezpiecznie):** `ORDER_MARK_PAID_DRY_RUN=1` w `.env` — webhook i odpytywanie statusu wołają `markPaid.php` w trybie
   `dryRun` (sprawdza zamówienie, kwotę i SQL, nic nie zapisuje). W logu serwera Next pojawia się `[tpay] DRY RUN …`.
   Zamówienie w Magento zostaje wtedy „nieopłacone”, nawet jeśli płatność w sandboxie przeszła.
2. **Sandbox Tpay:** konto `register.sandbox.tpay.com`, klucze z Integracje → API w `.env` (`TPAY_CLIENT_ID`, `TPAY_CLIENT_SECRET`, `NEXT_PUBLIC_TPAY_ENV=sandbox`).
   BLIK: kod zaczynający się od `777` (np. `777123`). Karty testowe i kwoty błędów: <https://support.tpay.com/sprzedawca/srodowisko-testowe-sandbox>
   (kwoty 500, 501 i 503 zł kończą się błędem dla kart/portfeli).
3. **Webhook lokalnie:** Tpay musi dotrzeć do aplikacji — tunel HTTPS na port dev serwera (np. `cloudflared tunnel --url http://localhost:80`)
   i jego adres w `NEXT_PUBLIC_APP_URL`. BLIK i portfele zadziałają też bez webhooka (odpytywanie `/api/tpay/status`),
   ale karta / Tpay / PayPo / Google Pay przez przekierowanie potrzebują webhooka, żeby strona zamówienia zobaczyła „opłacone”.
4. **Apple Pay** wymaga HTTPS i domeny zarejestrowanej w Apple i Tpay (`sklep.carinii.com.pl`) — lokalnie (`http://localhost`) się nie pokaże.
5. **Księgowanie naprawdę:** usuń `ORDER_MARK_PAID_DRY_RUN`, złóż jedno zamówienie testowe i sprawdź: status `processing`, faktura, wpis w historii,
   wiersz `success` w `payment_callbacks` oraz `/home/directseo/logs/markPaid.log`.
6. Bez kluczy Tpay można sprawdzić `curl`-em samą walidację tras `/api/tpay/*` i `markPaid.php` (`ping`, `dryRun`).

## Znane ograniczenia

- Statusy transakcji z `GET /transactions/{id}` są mapowane tolerancyjnie (`paid`/`correct`/`success` → opłacona); pełna lista
  wartości nie jest opisana w dokumentacji — warto zweryfikować w sandboxie.
- Brak limitowania liczby żądań na trasach `/api/tpay/*`, `/api/p24/gpay/*`.
- Google Pay przez P24 i szybka płatność nie były uruchomione z prawdziwym portfelem (Google TEST / Apple Pay) ani z sandboxem P24: sprawdzone z atrapami
  portfeli i podstawionym backendem. Do potwierdzenia: id metody Google Pay w P24 (266) i format podpisu powiadomienia P24 (zgodnie z opisem w dokumentacji, test jednostkowy na sztucznym CRC).
- Apple Pay w przeglądarce innej niż Safari (kod QR) nie był sprawdzony na prawdziwym urządzeniu: w osadzonej przeglądarce testowej Apple zwróciło `applePayUnsupported`.
- Krok 3 `markPaid.php` (faktura, mail, `processing`) odwzorowuje kod modułu `Tpay_Tpay`, ale nie był uruchomiony na prawdziwym
  zamówieniu (testowane: autoryzacja, walidacje, `dryRun` na prawdziwych zamówieniach, składnia). Pierwszą płatność w sandboxie
  warto przejść z kontrolą skutków w panelu Magento.
- `orders/index.php` uznaje za opłacone wyłącznie status `success`, a skrypt P24 (`payment/statusp24`) zapisuje `paid`
  — zamówienia opłacone przez ten skrypt (14 wierszy w momencie sprawdzenia) pokazują `pay: false`.
- Stare przyciski P24 (BLIK/Google Pay) zostają w kodzie; webhook P24 `/api/p24/verify` nadal jest atrapą (poza zakresem tej zmiany).
