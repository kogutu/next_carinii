# Wygodne Zwroty — logistyka zwrotów (Partner API)

Po złożeniu oświadczenia o odstąpieniu od umowy (`/odstapienie-od-umowy`) klient może nadać paczkę bez etykiety: wybiera punkt, a w punkcie
podaje kod nadania. Funkcja prawna (oświadczenie, potwierdzenie z datą i godziną) zostaje po naszej stronie; Wygodne Zwroty obsługują tylko
przesyłkę. Specyfikacja: <https://integracje.wygodnezwroty.pl/integracje/api> (OpenAPI jest wbudowany w stronę jako JSON, `const content = {…}`).

## Jak to działa

1. Klient klika „Nadaj paczkę przez Wygodne Zwroty” na ekranie po złożeniu oświadczenia → `POST /api/withdrawal/shipment`
   (`orderNumber`, `ref` = numer potwierdzenia OD-…, `email`).
2. Magento (`returns/wz_draft_data.php`) sprawdza zamówienie (numer + e-mail albo właściciel konta) oraz to, że oświadczenie należy do tego zamówienia,
   i zwraca dane do draftu: numer, datę, walutę, klienta (imię i nazwisko + e-mail) oraz **tylko pozycje objęte oświadczeniem**. Adresu i telefonu nie przekazujemy.
3. Next.js (`lib/wygodneZwroty.ts`) wywołuje `POST /partner-api/v1/returns/draft` z `flow: "shipment"`, `is_email_editable: false`,
   `is_order_number_editable: false` i `callback_url`, a klienta przekierowuje na zwrócony `redirect_url` (tylko https).
   Ponawiamy wyłącznie 502 i błędy sieci (3 próby, rosnąca przerwa). 400 = błędne dane albo limit darmowych draftów dla zamówienia → komunikat dla klienta.
4. Webhooki `return.created` / `return.updated` trafiają na `POST /api/wygodnezwroty/webhook`: podpis `X-Signature` (HMAC-SHA-256 surowego body, sekret = klucz API,
   porównanie w stałym czasie), potem zapis w Magento (`returns/wz_event.php`): deduplikacja po `event_id`, stan po `return_id` (starsze zdarzenie nie nadpisuje nowszego),
   wpis w historii zamówienia przy zmianie statusu lub przesyłki. Do Magento nie idą dane osobowe klienta ani numer konta.
   Przy błędzie odpowiadamy 500, więc Wygodne Zwroty ponawiają dostawę (do 12 prób przez ok. 8,5 godziny).

Tabele w bazie Magento (tworzone automatycznie): `carinii_wz_events` (event_id), `carinii_wz_returns` (return_id, zamówienie, status, przewoźnik, numer przesyłki).

## Uruchomienie (kolejność)

1. **Od Wygodnych Zwrotów** (panel/opiekun, tel. 799 355 477): adres bazowy API, Merchant Key i `mailbox_hid`.
2. **Zmienne** w Vercelu (oba projekty) i lokalnie w `.env.local`: `WYGODNE_ZWROTY_API_BASE_URL`, `WYGODNE_ZWROTY_API_KEY`, `WYGODNE_ZWROTY_MAILBOX_HID`
   (klucz tylko w sekretach, nigdy w repozytorium). Opcjonalnie `WYGODNE_ZWROTY_CALLBACK_URL`.
3. **Test klucza:** `node --env-file=.env.local scripts/wygodne-zwroty-settings.mjs check`, potem `show`.
4. **Ustawienia sklepu u dostawcy** (adres zwrotów Przemysłowa 40 i adres webhooka):
   `node --env-file=.env.local scripts/wygodne-zwroty-settings.mjs apply --webhook-url=https://<domena>/api/wygodnezwroty/webhook --yes`
   (bez `--yes` tylko pokazuje, co wyśle). To zmienia konfigurację u dostawcy — **do uruchomienia po decyzji właściciela**; webhook musi wskazywać domenę produkcyjną.
5. **Wdrożenie PHP** (`docs/php/returns/_lib.php`, `wz_event.php`, `wz_draft_data.php`) wg pamięci `magento-server-access`: `_lib.php` najpierw, odczekać OPcache (5 min).
6. **Włącz przycisk:** `NEXT_PUBLIC_WZ_RETURNS=on` i redeploy.
7. Test: zamówienie testowe → oświadczenie → „Nadaj paczkę…” → formularz WZ → po utworzeniu zwrotu wpis `[Wygodne Zwroty] …` w historii zamówienia w Magento.

## Dane osobowe i umowy

Do Wygodnych Zwrotów przekazujemy imię i nazwisko oraz e-mail klienta, numer i datę zamówienia, pozycje objęte oświadczeniem (nazwa, SKU, cena, rozmiar, zdjęcie).
Webhook zawiera dane osobowe klienta i numer konta — nie logujemy ich (kod loguje wyłącznie kod błędu). Zaktualizuj politykę prywatności o ten odbiorcę danych i sprawdź
umowę z Wygodnymi Zwrotami (rola procesora/administratora, powierzenie).
