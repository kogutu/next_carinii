# Odstąpienie od umowy online — wdrożenie i teksty do Magento

Funkcja „Odstąp od umowy tutaj” (art. 11a dyrektywy 2011/83/UE, dodany dyrektywą 2023/2673) działa w sklepie Next.js pod adresem
`/odstapienie-od-umowy`. Ten dokument opisuje, co jest zrobione w kodzie, oraz **propozycje tekstów do wklejenia w Magento (CMS, regulamin,
szablon maila)** — tych miejsc nie obsługuje repozytorium. Teksty prosimy zatwierdzić z prawnikiem.

> Stan prawny (październik 2026): unijny termin stosowania minął 19.06.2026, ale Polska nie wdrożyła przepisów (projekt: art. 30a ustawy
> o prawach konsumenta, bez daty wejścia w życie). Treść art. 11a znamy z opracowań, nie z pierwotnego tekstu — etykiety i wymogi
> trzymamy w jednym miejscu (`lib/withdrawal.ts`), żeby łatwo je skorygować.

## Co robi funkcja (kod)

| Element | Gdzie |
| --- | --- |
| Strona i dwa kroki (oświadczenie → „Potwierdź odstąpienie od umowy”) | `app/odstapienie-od-umowy/page.tsx`, `components/withdrawal/WithdrawalForm.tsx` |
| Etykiety, adres zwrotów, ścieżka | `lib/withdrawal.ts` |
| Przycisk „Odstąp od umowy tutaj” | `components/withdrawal/WithdrawalButton.tsx` — stopka każdej strony, strona zamówienia, panel klienta (przy każdym zamówieniu poza anulowanym), menu konta, strona zasad zwrotów, kontakt |
| Zapis, historia zamówienia, maile | `docs/php/returns/withdraw.php` (serwer: `directseo/nextjs/returns/`), tabela `carinii_returns` (`type = odstapienie`) |
| Gość / zalogowany | gość: imię i nazwisko + numer zamówienia + e-mail; zalogowany: zamówienie z listy konta (`/api/user/orders`), dane z konta |

Zasady działania: bez logowania, bez podawania przyczyny, bez zgody na regulamin; dostępne od złożenia zamówienia (blokada tylko dla zamówień
anulowanych i rozliczonych zwrotem); odstąpienie całe lub częściowe (wybrane pozycje); powtórne złożenie na to samo zamówienie zwraca
istniejące oświadczenie (bez duplikatu). Po potwierdzeniu klient dostaje e-mail z treścią oświadczenia oraz datą i godziną (z sekundami,
czas polski) — to jest potwierdzenie na trwałym nośniku; brak wysyłki zgłaszany jest sklepowi mailem `[BRAK POTWIERDZENIA]`.
Zamówienia, od odbioru których minęło ponad 14 dni (orientacyjnie), są przyjmowane i oznaczane do ręcznej oceny.

## Teksty do Magento (propozycje)

### Regulamin, § 7 ust. 3 (sposób złożenia oświadczenia) — nowe brzmienie

> 3. Oświadczenie o odstąpieniu od umowy Kupujący uprzywilejowany może złożyć:
> a) za pomocą funkcji „Odstąp od umowy tutaj”, dostępnej w Sklepie pod adresem {ADRES_SKLEPU}/odstapienie-od-umowy oraz jako przycisk w stopce
> każdej strony Sklepu, na stronie zamówienia i w panelu klienta. Funkcja jest dostępna od chwili złożenia zamówienia przez cały okres na
> odstąpienie. Kupujący podaje imię i nazwisko, numer zamówienia i adres e-mail, a następnie potwierdza oświadczenie przyciskiem „Potwierdź
> odstąpienie od umowy”. Sprzedawca niezwłocznie przekazuje Kupującemu na adres e-mail potwierdzenie otrzymania oświadczenia, zawierające jego
> treść oraz datę i godzinę złożenia;
> b) pisemnie na adres: Przemysłowa 40, 08-410 Wola Rębkowska;
> c) pocztą elektroniczną na adres: sklep@carinii.com.pl.

### Regulamin, § 7 ust. 5 — uzupełnienie

> Termin jest zachowany, jeżeli oświadczenie zostanie złożone przed jego upływem — także za pomocą funkcji „Odstąp od umowy tutaj”.

### Regulamin, Załącznik nr 1 (wzór formularza odstąpienia) — dopisek na początku

> Oświadczenie o odstąpieniu możesz złożyć online, bez pobierania formularza: {ADRES_SKLEPU}/odstapienie-od-umowy („Odstąp od umowy tutaj”).
> Po jego złożeniu otrzymasz na e-mail potwierdzenie z datą i godziną. Poniższy formularz jest opcjonalny.

### Strona CMS „Zwroty i reklamacje” (`/zwroty-reklamacje`)

- Usuń pusty znacznik `[BANER-WZ]`.
- Kroki zwrotu: **1.** Kliknij „Odstąp od umowy tutaj” (przycisk na tej stronie, w stopce i na stronie zamówienia). **2.** Odeślij towar w ciągu 14 dni
  od złożenia oświadczenia na adres: **Carinii – Magazyn, ul. Przemysłowa 40, 08-410 Wola Rębkowska**. **3.** Zwrócimy płatność nie później niż w ciągu
  14 dni od otrzymania oświadczenia (zgodnie z § 7 Regulaminu).
- Zostaw informację, że do zwrotu nie jest wymagany paragon fiskalny, oraz że bezpośrednie koszty odesłania ponosi Kupujący (jeśli taka jest polityka sklepu).
- Link „Zgłoś online” prowadzi teraz do formularza **reklamacji** (`/zwrot-reklamacja`); zwrot to „Odstąp od umowy tutaj”.

### Szablon maila z potwierdzeniem zamówienia (Magento: System → Transactional Emails)

Dodaj akapit: „Masz 14 dni na odstąpienie od umowy bez podawania przyczyny. Skorzystaj z funkcji „Odstąp od umowy tutaj”: {ADRES_SKLEPU}/odstapienie-od-umowy.”
(opcjonalnie z numerem zamówienia: `?order={{var order.increment_id}}`).

### Informacja przedumowna

W koszyku (pod zgodami) jest już krótka informacja o prawie odstąpienia i miejscu funkcji. Pełna informacja o prawie odstąpienia (termin, sposób, koszty)
powinna być zgodna z § 7 Regulaminu; dopisz w niej miejsce funkcji (stopka sklepu, strona zamówienia, panel klienta).

## Lista kontrolna po wdrożeniu

- [ ] Wstaw `{ADRES_SKLEPU}` (domena produkcyjna) i zatwierdź teksty z prawnikiem.
- [ ] Regulamin § 7 ust. 3 i 5, Załącznik nr 1, strona „Zwroty i reklamacje”, szablon maila zamówienia.
- [ ] Jedno zamówienie testowe: oświadczenie z przeglądarki gościa i z konta; sprawdź maila (treść, data/godzina), wpis w historii zamówienia i rekord w `carinii_returns`.
- [ ] Wygodne Zwroty (logistyka kodu nadania) — Etap 2: wymagane Merchant Key i `mailbox_hid` oraz pełna specyfikacja API.
