# Ulubione (lista życzeń)

Lista ulubionych produktów, powiązana z kontem po **adresie e-mail z sesji** (zawsze małymi literami, ustalanym po stronie serwera).
Dane zalogowanych klientów leżą w MySQL (baza `jsk_carnetxjs`, ta sama co `payment_callbacks`), w osobnej tabeli:

```sql
CREATE TABLE IF NOT EXISTS wishlist_items (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,          -- sku produktu (model + kolor), klucz listy
    slug VARCHAR(255) NOT NULL DEFAULT '',
    added_at BIGINT UNSIGNED NOT NULL,  -- ms od 1970 (UTC)
    UNIQUE KEY uq_email_sku (email, sku),
    KEY idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

Tabela tworzy się sama przy pierwszym użyciu (`lib/wishlist/server.ts`). Limit: 300 produktów na konto.

## Jak to działa
- **Klucz to `sku`**: karty na listingach dostają z Typesense tylko część pól (bez `id`), ale zawsze mają `sku` i `slug`.
- **Gość**: lista tylko w `localStorage` (`carinii-wishlist`).
- **Zalogowany**: każde dodanie/usunięcie jest od razu widoczne w UI, a w tle zapisywane przez `/api/wishlist`
  (przy błędzie zapisu zmiana w przeglądarce jest cofana).
- **Logowanie**: `WishlistSync` scala listę gościa z listą na koncie (`POST /api/wishlist/sync`), lista z konta staje się źródłem prawdy.
- **Wylogowanie**: lista w przeglądarce jest czyszczona (nie zostaje na wspólnym komputerze).
- **Serduszko** (`components/wishlist/WishlistButton.tsx`) czyta jeden store (`stores/wishlistStore.ts`), więc świeci się spójnie
  na karcie w kategorii, w karuzelach, na stronie produktu i na liście `/ulubione`; licznik jest w nagłówku.
- `/ulubione` używa tej samej siatki i karty produktu (`ProductGrid`/`ProductItem`) co kategoria; dane produktów pobiera z Typesense po `sku`.

## API (sesja wymagana, e-mail z sesji)
| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/api/wishlist` | lista klienta |
| POST | `/api/wishlist` | `{ sku, slug? }` — dodaje |
| DELETE | `/api/wishlist?sku=...` | usuwa |
| POST | `/api/wishlist/sync` | `{ items: [...] }` — scala listę gościa, zwraca pełną listę |
