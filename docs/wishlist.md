# Ulubione (lista życzeń)

Lista ulubionych produktów **bez logowania**: kluczem listy jest wyłącznie **adres e-mail** (małe litery, bez spacji).
Dane leżą w MySQL (baza `jsk_carnetxjs`, ta sama co `payment_callbacks`), w osobnej tabeli:

```sql
CREATE TABLE IF NOT EXISTS wishlist_items (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,          -- sku produktu (model + kolor), klucz produktu na liście
    slug VARCHAR(255) NOT NULL DEFAULT '',
    added_at BIGINT UNSIGNED NOT NULL,  -- ms od 1970 (UTC)
    UNIQUE KEY uq_email_sku (email, sku),
    KEY idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

Tabela tworzy się sama przy pierwszym użyciu (`lib/wishlist/server.ts`). Limit: 300 produktów na adres.

## Jak to działa dla klienta
1. Klik w serduszko bez zapamiętanego adresu → okno **„Podaj e-mail, aby zapisać ulubione”**. Po podaniu adresu produkt trafia na listę.
2. Adres jest zapamiętany w `localStorage` (`carinii-wishlist`, wraz z kopią listy dla szybkiego UI) — kolejne kliknięcia nie pytają o nic.
3. `/ulubione` bez zapamiętanego adresu pokazuje **tylko pole „Podaj e-mail”**; ten sam adres na innym urządzeniu przywraca całą listę.
4. „To nie Ty? Zmień e-mail” na stronie listy zapomina adres w tej przeglądarce (lista na serwerze zostaje).

Serduszko (`components/wishlist/WishlistButton.tsx`) czyta jeden store (`stores/wishlistStore.ts`), więc świeci się spójnie na karcie
w kategorii, w karuzelach, na stronie produktu i na liście `/ulubione`; licznik jest w nagłówku. Dodanie/usunięcie jest widoczne od razu,
a zapis na serwerze idzie w tle (przy błędzie zmiana w przeglądarce jest cofana). Klucz produktu to `sku`, bo karty na listingach nie mają `id`.

## Bezpieczeństwo i prywatność
- **Kto zna adres e-mail, zobaczy i zmieni jego listę** — to świadomy kompromis (brak logowania = więcej dodanych produktów).
  Na liście są wyłącznie produkty ze sklepu; endpointy niczego nie ujawniają o istnieniu konta.
- Adres jest walidowany i normalizowany po stronie serwera, `sku` ma ścisły wzorzec, zapytania SQL są parametryzowane.
- Prosty limit zapytań na IP (`lib/rateLimit.ts`: 240 / 10 min; „best effort” w pamięci instancji).
- Adres e-mail to dane osobowe: w oknie jest informacja o celu (zapis listy) i link do polityki prywatności.
  **Wysyłanie czegokolwiek marketingowego na te adresy wymaga osobnej zgody.**

## API (e-mail w ciele żądania, wszystko POST)
| Ścieżka | Ciało | Opis |
|---|---|---|
| `/api/wishlist/list` | `{ email }` | lista dla adresu |
| `/api/wishlist/add` | `{ email, items: [{ sku, slug? }] }` | dodaje (duplikaty pomijane), zwraca pełną listę; do 50 wpisów naraz |
| `/api/wishlist/remove` | `{ email, sku }` | usuwa produkt |
