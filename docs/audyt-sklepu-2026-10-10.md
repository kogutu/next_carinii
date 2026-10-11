# Audyt sklepu Carinii (Next.js) — 2026-10-10

Zakres: co jeszcze brakuje w sklepie (to-do), SEO i PageSpeed, UX pod kątem klientek i butów.
Środowisko: https://next-carinii.vercel.app (build z `main`), porównanie z działającym sklepem Magento (sklep.carinii.com.pl).
Metody: Lighthouse 12 lokalnie (mobile + desktop: strona główna, kategoria, produkt), crawl HTML 15 adresów, przegląd kodu, przejście przez sklep na telefonie (375 px) i desktopie.

> Uwaga: Lighthouse mobile w tym audycie to symulacja (throttling), więc liczby bezwzględne są orientacyjne. Kierunek i przyczyny są jednoznaczne.

---

## Status wdrożenia

**Runda 1 — wdrożona (commity 6d969b8 i 00e45b4):** canonical (globalny `/fav/` usunięty, produkt wskazuje poprawny adres), `robots.txt` i `sitemap.xml` (1134 adresy), prawdziwy HTTP 404, `noindex` dla szukania/kasy/potwierdzeń/panelu, JSON-LD (Organization, WebSite, Product, BreadcrumbList), naprawa renderu serwerowego karty produktu na Vercelu (usunięty jsdom — strona produktu miała wcześniej pusty HTML bez h1), galeria przez optymalizator obrazów z opisami `alt`, strona główna ładuje tylko właściwe wideo (dopiero w pobliżu widoku) z plakatem dla hero, kategoria: pierwsze 8 kart i linki do produktów od razu w HTML + optymalizacja zdjęć kart, metadane w `<head>` dla botów (w tym Googlebot), opis meta jako czysty tekst, nagłówki bezpieczeństwa, usunięcie pozostałości HERT (w tym publicznego `users.json`), usunięte logowanie kluczy płatności (PayU/P24) do logów.

Pomiar na Vercelu (Lighthouse mobile, symulacja), przed → po:

| Strona | Wydajność | LCP | Waga | SEO |
|---|---|---|---|---|
| Produkt | 62 → 75 | 20,6 s → 5,4 s | 4,0 → 1,1 MB | 92 → 92 |
| Główna | 80 → 84 | 4,3 s → 3,4 s | 28,3 → 8,3 MB | 85 → 100 |
| Kategoria | 69 → 78 | 5,3 s → 5,0 s | 1,0 → 1,0 MB | 83 → 92 |

Uwagi: lokalny Lighthouse nie jest rozpoznawany jako bot, więc nadal zgłasza „brak meta description” na kategorii i produkcie (metadane są wtedy w `<body>` dzięki strumieniowaniu); Googlebot i PageSpeed dostają je w `<head>`. Pozostały LCP kategorii/produktu to głównie ciężar JavaScriptu przy hydracji (runda 2: rozmiar paczek, widżet Google Translate, ISR).
**Runda 2 — cookies i analityka (commity adf370a, ccabecf) + poprawka wyszukiwarki (91d7578):** baner zgody na cookies (równorzędne „Akceptuję wszystkie” / „Tylko niezbędne”, ustawienia analityczne i marketingowe, link „Ustawienia cookies” w stopce); Google Analytics 4, Google Ads (dwie konwersje „dodanie do koszyka” jak w Magento) i Meta Pixel z tymi samymi identyfikatorami co w Magento, ładowane dopiero po zgodzie (Consent Mode v2); zdarzenia page_view, view_item, add_to_cart, begin_checkout, purchase; Google Translate ładuje się dopiero po wybraniu języka (–100 KB skryptów Google na każdej stronie, bez zgody); okno wyszukiwarki zamyka się po wejściu w produkt.
Uwagi: analityka działa tylko na `sklep.carinii.com.pl` (staging i Vercel są wyłączone; wymuszenie: `NEXT_PUBLIC_ANALYTICS=on`, test bez wysyłki: `localStorage.carinii_analytics_debug = 'log'`). Produkty mają we wszystkich usługach to samo ID: ID produktu głównego z katalogu (np. 86071), jak w Magento (commit b74adc3). Konwersje „zakup” w Google Ads działają z importu GA4 (dwie aktywne akcje), więc etykieta konwersji nie jest potrzebna — „Zakup” z tagu witryny ma w Ads status „Wymaga uwagi” (do sprawdzenia w Ads). edrone (app_id z Magento) ładuje się po zgodzie marketingowej i dostaje product_view, add_to_cart i order; `platform: 'custom'` jest ustawione z dokumentacji — warto potwierdzić w panelu edrone, że zdarzenia dochodzą. askNOW nie został przeniesiony (zgodnie z ustaleniem: na razie tylko edrone).
**Zgody (commit 03046a1):** wdrożone.
**Nadal otwarte:** z sekcji P0 formularz kontaktowy, hasło MySQL (do `.env`), baner „Dzień Kobiet” i „120% taniej”; P1 (a11y, opinie, pliki wideo do rekompresji, hydratacja JS) i UX butów.

> Sprostowanie: „12 z 14 obrazów bez alt” z pierwszej wersji raportu było błędem — to obrazy dekoracyjne (awatary w menu, ikony płatności w stopce) z poprawnym `alt=""`. Prawdziwa luka to opisy zdjęć w galerii produktu (były „Product 1”) — naprawione w rundzie 1.

---

## 1. Wynik w liczbach

| Strona | Wydajność mobile | Wydajność desktop | Dostępność | SEO | LCP mobile |
|---|---|---|---|---|---|
| Strona główna | 80 | 97 | 82 | 85 | 4,3 s |
| Kategoria | 69 | 96 | 77 | 83 | 5,3 s |
| Produkt | **62** | 94 | 82 | 92 | **20,6 s** |

Waga stron na telefonie: strona główna **28,3 MB** (25,9 MB to wideo), produkt 4,0 MB (2,5 MB to jedno zdjęcie PNG), kategoria 1,0 MB.

---

## 2. Priorytet P0 — naprawić przed oddaniem ruchu z Magento

### SEO (to może wyciąć sklep z Google albo rozmyć ranking)

| # | Problem | Dowód | Poprawka |
|---|---|---|---|
| 1 | **Canonical wszędzie wskazuje `/fav/`** (strona główna, koszyk, kasa, panel, kontakt, CMS, szukaj, 404) | `app/layout.tsx` ustawia `alternates.canonical: '/fav/'`, a strony bez własnych metadanych je dziedziczą. Lighthouse: „Document does not have a valid rel=canonical” | Usunąć canonical z layoutu, ustawić `metadataBase` i canonical per strona (w tym `/` dla głównej) |
| 2 | **Canonical produktu prowadzi do 404** | `app/[...slug]/metadata.ts`: `/produkt/${slug}`, a sklep serwuje produkt pod `/${slug}` | Canonical = rzeczywisty adres produktu |
| 3 | **Brak `robots.txt` i `sitemap.xml`** — oba adresy zwracają stronę 404 ze statusem 200 | crawl + curl; Lighthouse „robots.txt is not valid, 52 errors” | Dodać `app/robots.ts` i `app/sitemap.ts` (kategorie + produkty z Typesense), zablokować koszyk, kasę, panel, szukaj, success |
| 4 | **Soft-404: nieistniejące adresy zwracają 200** | `/to-nie-istnieje-xyz.html` → 200, `/obuwie/nie-ma-takiej` → 200; `loading.tsx` w `app/[...slug]` powoduje, że status jest wysyłany przed rozstrzygnięciem `notFound()` | Rozstrzygać typ strony przed streamingiem (usunąć `loading.tsx` z tego segmentu albo przenieść sprawdzenie wyżej) |
| 5 | **Strona produktu bez treści w HTML**: 0 × `<h1>`, brak JSON-LD, brak przycisku w SSR, błąd hydracji React #419 | crawl produktu; `ProductJsonLd` istnieje w repo, ale nie jest używany | Wyrenderować produkt po stronie serwera, dodać `Product` + `Offer` + `BreadcrumbList` |
| 6 | **Brak jakichkolwiek danych strukturalnych** (poza `ContactPage`) | crawl: `json_ld: []` na głównej, kategorii i produkcie | `Organization`, `WebSite` (SearchAction), `BreadcrumbList`, `Product` z ceną, dostępnością i oceną |
| 7 | **Wersja testowa jest indeksowalna** (`index, follow`) i różni się od Magento | `robots_meta` na wszystkich stronach | Do czasu przełączenia domeny: `noindex` lub ochrona hasłem na Vercelu |
| 8 | Zduplikowane/placeholderowe metadane w layoutcie | `generator: 'v0.app'`, `yandex-verification: 'your-yandex-verification-code'`, tytuł kategorii głównej „w 2023 roku” | Usunąć, poprawić |

### PageSpeed

| # | Problem | Dowód | Poprawka |
|---|---|---|---|
| 9 | **Produkt: LCP 20,6 s na telefonie** — zdjęcie główne to surowy PNG 2,5 MB z Magento, `alt="Product 1"` | Lighthouse: „Serve images in next-gen formats” oszczędza 11,7 s | Użyć `next/image` z `sizes` i `priority` dla pierwszego zdjęcia, źródło: miniatura Magento (`cache/…/image/…`) albo WebP; poprawić `alt` |
| 10 | **Strona główna ładuje ~26 MB wideo na telefonie** (`magda-desk.webm` 10,6 MB, `magda-mob.webm` 10,2 MB, `hero-mob.webm` 5,7 MB) | `heavy.py`: Media = 25,9 MB z 28,3 MB. Ukryte wideo (desktop na telefonie i odwrotnie) też się pobiera | `preload="none"`, ładować tylko wideo dla aktualnego widoku, wersje ≤1,5 MB, plakat (poster) jako LCP, wyłączyć autoplay przy `prefers-reduced-data` |
| 11 | Kategorie i produkty są renderowane dynamicznie (`Cache-Control: private, no-store`) | nagłówki crawlu | ISR z `revalidate` (np. 300 s) i tagami dla produktów — skróci TTFB i odciąży Magento |

### Prawo / zgody (RODO, UOKiK)

| # | Problem | Status |
|---|---|---|
| 12 | Zgoda marketingowa była sklejona z regulaminem w jednej obowiązkowej checkboxie w kasie (nieważna wg RODO) | **Zrobione** (commit 03046a1): osobna wymagana zgoda na regulamin i osobna dobrowolna marketingowa |
| 13 | Brak zgody na regulamin / marketing w ulubionych, alercie rozmiaru, rejestracji, kontakcie, zwrotach, szybkiej płatności | **Zrobione** (03046a1) + rejestr zgód w MySQL (`consent_log`) |
| 14 | **Brak banera zgody na cookies** i brak jakichkolwiek skryptów analitycznych/reklamowych | Do zrobienia: CMP (np. Cookiebot / własny baner) + Consent Mode v2, dopiero potem GA4/Ads/Pixel |
| 15 | Hasło do bazy MySQL wpisane na stałe w `lib/db-mysql.ts` (repozytorium) | Przenieść do zmiennych środowiskowych i **zmienić hasło** (jest w historii gita) |
| 16 | Baner „ŚWIĘTUJEMY DZIEŃ KOBIET! … do -30%” + kod WOMAN i „**120% taniej**” na produkcie — w październiku, a „120% taniej” jest niemożliwe rachunkowo | Wyłączyć/poprawić; ryzyko wprowadzania w błąd (UOKiK) |

### Funkcje, które udają, że działają

| # | Problem | Poprawka |
|---|---|---|
| 17 | **Formularz kontaktowy w oknie „Biuro obsługi” nic nie wysyła** (`SupportModal`: `setTimeout` zamiast żądania), a klientka widzi „Wysłano” | Podpiąć do maila/Magento (endpoint + powiadomienie) albo na razie ukryć formularz |
| 18 | Alert „Powiadom mnie, gdy rozmiar będzie dostępny” nie wysyłał nic (`console.log`) | **Częściowo**: prośba zapisuje się w `consent_log` (sku + rozmiar). Brakuje joba, który po dostawie wysyła e-mail |
| 19 | Pozostałości z innego projektu (HERT, sprzęt piekarniczy): `/przedstawiciele-handlowi` (tytuł „HERT”), `pages/cms/sprzedaz-maszyn.tsx`, `components/hert/brands.tsx` i `home-seo.tsx` z linkami do hert.pl, obraz `piekarnictwo.jpg` w kategorii | Usunąć nieużywane trasy i komponenty |
| 20 | **`/users.json` jest publicznie dostępny** (200) — lista 9 przedstawicieli handlowych z e-mailami i telefonami (pozostałość po HERT) | Usunąć `public/users.json`, `data.json`, `my-data*.json`, `postal-codes.json` jeśli niepotrzebne |

---

## 3. Priorytet P1

**SEO**
- Strony kategorii mają 2 × `<h1>`; główna i produkt — niespójnie. Jedna h1 na stronę.
- Opis meta produktu to pełny opis z `\r\n` (>1000 znaków). Przyciąć do ~155 znaków, bez znaków nowej linii.
- `og:image` produktu ma podwójny ukośnik (`https://sklep.carinii.com.pl//media/...`).
- Strony koszyk, szukaj, panel mają `index, follow` — dodać `noindex`.
- Paginacja i filtry w kategoriach: `rel=canonical` na adres bez parametrów filtrów (poza kilkoma wartościowymi filtrami), linki do kolejnych stron w HTML.
- Przekierowania: wielkie litery (`/Obuwie.html`) zwracają 200 zamiast 301 do wersji małej.
- Brak `hreflang` (jest przełącznik Google Translate — rozważyć, czy w ogóle potrzebny; ładuje ~100 KB skryptów z Google na każdej stronie).
- Brak opinii (w Magento są Trustmate + `AggregateRating`) — gwiazdki w wynikach to realny wzrost CTR.

**PageSpeed / dostępność**
- Dostępność (Lighthouse na wszystkich trzech typach stron): przyciski i linki bez nazwy dostępnej, niewystarczający kontrast części tekstów, linki odróżnione tylko kolorem, `aria-*` niezgodne z rolami, niepoprawna kolejność nagłówków. Dokładne elementy: `scratchpad/lh/a11y.py` (do powtórzenia po poprawkach).
- Cele dotykowe za małe (Lighthouse mobile: strona główna i kategoria).
- JS: ~80 KB nieużywanego; „legacy JavaScript” ~13 KB; wątek główny 5,9–9,7 s na mobile (TBT 150–420 ms). Podzielić ciężkie moduły (wyszukiwarka, mega menu) dynamicznym importem.
- Brak nagłówków bezpieczeństwa (jest tylko HSTS): dodać `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`/CSP w `next.config.ts`.
- Strona nie wchodzi do bfcache (3 powody) — przyspiesza powroty „wstecz”.
- Placeholdery listy produktów (`LazyProductSlot`) powodują skoki układu przy szybkim scrollu — zarezerwować wysokość.

**Brakuje w porównaniu z Magento**
- Google Analytics (G-9CTP8TYMND) i Google Ads (AW-730929499), Meta Pixel, baner cookies, Trustmate, newsletter (formularz zapisu w stopce), breadcrumbs w HTML + JSON-LD.
- Potwierdzenia e-mail dla zwrotów/reklamacji wysyła Magento — sprawdzić, czy wszystkie szablony działają dla zamówień z nowego sklepu.

---

## 4. UX pod kątem klientek i butów

Obserwacje z przejścia przez sklep na telefonie i desktopie (zakupy kobiet są w większości na telefonie — to jest główny widok).

**Wybór rozmiaru i dopasowanie (największa dźwignia konwersji i redukcji zwrotów)**
1. Tabela rozmiarów (`pages/product/SizeSwatch.tsx`) jest wpisana na stałe i wygląda na wzorcową (kolumny UK/US, jedna tabela dla wszystkich modeli) — dane trzeba potwierdzić z działem produktu. Potrzebne: **długość wkładki w cm per rozmiar** dla marki Carinii, wskazówka jak zmierzyć stopę.
2. **Kozaki/oficerki: brakuje obwodu łydki i wysokości cholewki** w widocznym miejscu (są tylko w opisie lub wcale). To najczęstszy powód zwrotu kozaków. Dodać blok „Dopasowanie” przy wyborze rozmiaru: obwód cholewki (cm), wysokość cholewki, wysokość obcasa, materiał podszewki, informacja „fason standardowy / węższa cholewka”.
3. Informacja „rozmiar wypada: standardowo / mały / duży” (na podstawie zwrotów) przy selektorze rozmiaru.
4. Niedostępne rozmiary: klik otwiera alert e-mail (dobre) — pokazać też „ostatnia sztuka” i, jeśli rozmiar jest w innym kolorze, link do wariantu.
5. Wybór rozmiaru jest nad zgięciem na telefonie — dobrze; dodać **przyklejony pasek „Dodaj do koszyka”** na dole ekranu po przewinięciu galerii.

**Zaufanie przy przycisku zakupu**
6. Przy CTA brakuje bloku: dostawa (od-do, koszt), **14 dni na zwrot**, bezpłatny zwrot (jeśli dotyczy), płatności (BLIK, karta, Apple/Google Pay), polska produkcja. Dziś jest PayPo i „120% taniej” — komunikat reklamowy zamiast informacji.
7. Opinie klientek: w Magento są (Trustmate); tu brak. Dla butów szczególnie ważne „czy wygodne / jak z rozmiarem”.
8. Zdjęcia: dodać zdjęcie na modelce z informacją o wzroście modelki i noszonym rozmiarze; przy kozakach — zdjęcie na łydce (szerokość cholewki).

**Karty produktów i kategorie**
9. Na kartach widoczny jest wewnętrzny SKU — ukryć lub zastąpić nazwą koloru.
10. Nadmiar plakietek (nowość, promocja, procent) — ograniczyć do jednej głównej.
11. Filtry: dla butów dodać **filtry po wysokości obcasa, wysokości cholewki, rodzaju podeszwy, materiale** (część danych jest w Typesense), pamiętając o przyjaznej kolejności (rozmiar, kolor, cena na górze). Wybrane filtry jako „chipsy” nad listą.
12. Wyszukiwarka (po zmianach z dziś w stylu sklepu): dodać sugestie kategorii/fraz („botki”, „czółenka”) zamiast tylko listy produktów; usunąć stopkę „Powered by DevBack.it” i podpowiedź ESC z okna wyszukiwania.
13. Hero na stronie głównej: kontrast tekstu na zdjęciu/wideo na telefonie; główny CTA widoczny bez przewijania.

**Koszyk i płatność**
14. Szybka płatność (Apple/Google Pay) wymaga teraz akceptacji regulaminu — dodać po stronie klientki krótką informację, dlaczego przycisk jest nieaktywny (jest komunikat po kliknięciu).
15. Zwrot/reklamacja ze zdjęciami działa end-to-end — dodać link „Zwrot lub reklamacja” w e-mailu potwierdzającym zamówienie i na stronie zamówienia.
16. Ulubione działają bez logowania (adres e-mail) — dodać możliwość „powiadom o obniżce ceny” (kolejny, naturalny powód zgody marketingowej).

---

## 5. Lista do zrobienia (kolejność wdrożenia)

**Runda 1 — fundamenty SEO i szybkość (największy zwrot)**
1. Canonical: usunąć z layoutu, naprawić produkt, dodać `metadataBase`.
2. `robots.ts` + `sitemap.ts`; `noindex` dla koszyka, kasy, panelu, szukaj, success.
3. Soft-404: prawdziwy status 404.
4. SSR strony produktu (h1, opis, przycisk) + JSON-LD (`Product`, `BreadcrumbList`, `Organization`, `WebSite`).
5. Obrazy: `next/image` z `priority` dla LCP w produkcie, poprawne `alt`, miniatury zamiast PNG.
6. Wideo na stronie głównej: odchudzenie i ładowanie tylko właściwej wersji.

**Runda 2 — zaufanie i zgodność**
7. Baner cookies + Consent Mode, potem GA4/Ads/Pixel.
8. Wyłączyć nieaktualny baner Dzień Kobiet i „120% taniej”.
9. Formularz kontaktowy: realna wysyłka albo ukrycie.
10. Usunąć pozostałości HERT i publiczne pliki z danymi (`users.json` itd.).
11. Hasło MySQL do `.env` + zmiana hasła.
12. Nagłówki bezpieczeństwa.

**Runda 3 — konwersja (buty)**
13. Blok „Dopasowanie” (cm, obwód łydki, wysokość cholewki/obcasa) + realna tabela rozmiarów.
14. Przyklejony przycisk zakupu na telefonie + blok zaufania przy CTA.
15. Opinie (Trustmate lub własne) + `AggregateRating`.
16. Filtry specyficzne dla butów, sugestie w wyszukiwarce.
17. Wysyłka e-maili „rozmiar dostępny” na podstawie `consent_log`.

**Otwarte pytania do Ciebie**
- Czy w Vercelu ustawione są zmienne środowiskowe (m.in. `CUSTOMER_API_TOKEN`) i zrobiony Redeploy?
- Czy usunąć linki „Ulubione” z menu konta (lista nie jest już związana z kontem)?
- Czy chcesz zapisywać zgody także dla klientek już zalogowanych w panelu (profil: przełącznik zgody marketingowej + synchronizacja z newsletterem w Magento)?
- Domyślny wybór faktury: „Firma” czy „Osoba prywatna”?

---

## 6. Zgody — co zrobiono (commit 03046a1)

- Wspólny komponent `components/consent/ConsentFields.tsx`: (1) **regulamin sklepu + polityka prywatności — wymagane**, (2) **zgoda marketingowa — osobna, dobrowolna, domyślnie niezaznaczona** (e-mail, a tam gdzie zbieramy telefon — e-mail i SMS).
- Podpięte w: kasie, szybkiej płatności (przyciski Apple/Google Pay aktywne dopiero po akceptacji regulaminu), ulubionych, alercie rozmiaru, rejestracji konta, formularzu kontaktowym, zwrotach/reklamacjach.
- Rejestr zgód: tabela MySQL `consent_log` (e-mail, telefon, źródło, zgoda na regulamin, zgoda marketingowa, wersja treści `CONSENT_VERSION`, kontekst — nr zamówienia / sku i rozmiar, user-agent, czas). Zapis przez `POST /api/consents` po udanym wysłaniu formularza. Wycofanie zgody = nowy wpis z `marketing_accepted = 0` (obowiązuje najnowszy).
- Zamówienie dostaje flagę zgody marketingowej (`agreeToNewsletter`) w historii zamówienia Magento jak wcześniej, ale teraz z osobnej checkboxa.
- Zmieniając treść zgód, podnieś `CONSENT_VERSION` w `lib/consents.ts`.
- Do zrobienia: panel klienta (wycofanie/zmiana zgody), formularz newsletter w stopce (jeszcze nie ma), eksport zgód do Magento/ESP.
