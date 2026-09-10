# Dyeloty MVP Readiness Audit

## Executive summary

Status: almost ready.

Dyeloty wygląda na gotowe do małej, kontrolowanej rundy testów z 5-10 osobami, pod warunkiem domknięcia kilku porządków przed wysłaniem linku. Główne przepływy MVP są obecne i sensownie spięte: homepage działa na `/`, wyszukiwarka i filtry są dostępne, auth używa dynamicznego callback URL, konto pobiera dane zalogowanego użytkownika, CRUD ogłoszeń ma owner checks po stronie klienta i powinien być zabezpieczony przez RLS, zdjęcia mają upload i nieblokujący cleanup, a favorites mają osobną tabelę z RLS.

Build produkcyjny przechodzi: `npm run build` zakończył się sukcesem.

Lint nie przechodzi: `npm run lint` zwraca 4 błędy i 2 ostrzeżenia. Nie blokuje to samego builda, ale warto poprawić przed publiczniejszym testem.

## Critical issues

Brak P0 wykrytych w audycie statycznym.

Nie widzę obecnie błędu, który jednoznacznie blokuje pokazanie aplikacji pierwszym testerkom, jeśli test będzie kontrolowany i obejmie ręczne monitorowanie zgłoszeń.

## Important fixes before testers

1. Uporządkować legacy `/pl` w linkach użytkownika.

   Potwierdzone miejsca:
   - `app/About.tsx`: `homeHref` dla PL nadal wskazuje `/pl`.
   - `app/Footer.tsx`: linki PL nadal wskazują `/pl/about`, `/pl/faq`, `/pl/contact`.
   - `app/add-listing/AddListingPage.tsx`: link powrotu dla PL nadal wskazuje `/pl`.

   `/pl` nadal istnieje jako trasa, więc to nie jest P0, ale po decyzji, że homepage kanoniczny to `/`, linki użytkownika powinny konsekwentnie wracać na `/`, `/about`, `/#listings`.

2. Poprawić błędy lint przed szerszą betą.

   `npm run lint` zgłasza:
   - `app/account/page.tsx:139` - `setActiveSection(getInitialAccountSection())` bezpośrednio w `useEffect`.
   - `app/add-listing/AddListingPage.tsx:51` - `setImagePreviewUrl("")` bezpośrednio w `useEffect`.
   - `app/edit-listing/[id]/page.tsx:116` - `setImagePreviewUrl("")` bezpośrednio w `useEffect`.
   - `app/listing/[id]/page.tsx:72` - zwykły `<a href="/">` do trasy wewnętrznej zamiast `Link`.
   - Ostrzeżenia: `<img>` w add/edit forms zamiast `next/image`.

3. Potwierdzić ręcznie, że migracja cleanupu obrazków jest zastosowana w Supabase.

   Plik:
   - `supabase/migrations/20260702000000_add_listing_images_delete_policy.sql`

   Bez tej polityki usuwanie ogłoszenia nadal powinno działać, ale cleanup zdjęć z `listing-images` może nie usunąć pliku i tylko zaloguje ostrzeżenie.

4. Ujednolicić komunikat błędu auth callback.

   `app/auth/callback/page.tsx` ma dobry mechanizm techniczny: czyta `code`, woła `exchangeCodeForSession`, sprawdza sesję, ma timeout i redirect do `/account`. UX błędu może być jednak mylący, bo przy błędzie karta nadal zawiera tekst "Kończymy logowanie...". Dla testerów warto pokazać prostszy komunikat po polsku i link do ponownego logowania.

5. Zweryfikować aktualne RLS dla `listings` w Supabase.

   Kod klienta konsekwentnie dopina `eq("user_id", session.user.id)` przy edycji, usuwaniu i zmianie statusu, co jest dobre. Audyt repo nie pokazuje jednak pełnej migracji bazowej RLS dla `listings`. Przed testami warto potwierdzić w Supabase, że:
   - publiczny odczyt listingów jest zgodny z intencją produktu,
   - insert wymaga auth i `user_id = auth.uid()`,
   - update/delete mają `USING` i `WITH CHECK` po ownerze.

## Nice-to-have polish

1. Dodać `metadataBase`, canonical URL i podstawowy OG image.

   `app/layout.tsx` ma tytuł, opis i Open Graph title/description, ale nie wskazuje domeny `https://dyeloty.pl` ani grafiki preview. Linki w komunikatorach mogą wyglądać generycznie.

2. Zdecydować, czy trasy `/pl/*` mają zostać jako legacy aliases.

   Obecnie istnieją `/`, `/pl`, `/en` oraz podstrony `/pl/about`, `/pl/privacy` itd. To działa, ale na MVP może rozmywać kanoniczną strukturę. Jeśli zostają, dobrze dodać konsekwentne linkowanie i ewentualnie później canonical/redirect strategy.

3. Doprecyzować copy przy ulubionych dla niezalogowanych.

   `app/FavoriteButton.tsx` przekierowuje niezalogowanego użytkownika na `/account`. Technicznie jest OK, ale przed testami można dodać bardziej widoczny komunikat na stronie konta, że logowanie jest potrzebne do zapisania ulubionych.

4. Uporządkować starsze komponenty, jeśli nie są używane.

   W repo są starsze komponenty typu `Hero.tsx`, `HowItWorks.tsx`, `Stats.tsx`, `LoginButton.tsx`. Nie jest to problem runtime, ale może mylić dalsze prace.

5. Rozważyć `next/image` dla podglądów uploadu.

   Lint ostrzega na `<img>` w `app/add-listing/AddListingPage.tsx` i `app/edit-listing/[id]/page.tsx`. Dla MVP to drobiazg, ale łatwy porządek wydajnościowy.

## Technical risks

Auth:
- Dobrze: `app/authRedirect.ts` używa `${window.location.origin}/auth/callback`, więc nie ma hardcodowanego localhost ani Vercel URL.
- Dobrze: `app/supabase.ts` ma `flowType: "pkce"`, `detectSessionInUrl: false`, `persistSession: true`, `autoRefreshToken: true`.
- Dobrze: `app/auth/callback/page.tsx` ręcznie wywołuje `exchangeCodeForSession(code)` i dopiero po realnej sesji robi redirect do `/account`.
- Ryzyko: user-facing error callbacku jest techniczny i częściowo po angielsku.

Supabase/env:
- Dobrze: klient czyta `NEXT_PUBLIC_SUPABASE_URL` i `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Nie znaleziono użycia `service_role`, `SUPABASE_SERVICE_ROLE_KEY` ani `SUPABASE_SECRET_KEY` w kodzie aplikacji.

Routing:
- Dobrze: `app/page.tsx` renderuje homepage na `/`, a build pokazuje `/` jako dynamic route.
- Ryzyko: część linków nadal wskazuje `/pl` lub `/pl/*`, mimo że produktowo homepage ma być `/`.
- Nie znaleziono `dyeloty.vercel.app` ani `vercel.app` w kodzie aplikacji.
- `localhost:3000` występuje tylko w `README.md`, co jest akceptowalne jako lokalna dokumentacja.

Storage:
- Dobrze: `app/listingImages.ts` usuwa tylko URL-e wyglądające jak publiczne obiekty z `/storage/v1/object/public/listing-images/listings/{userId}/...`.
- Dobrze: helper nie dotyka zewnętrznych URL-i.
- Ryzyko: cleanup jest nieblokujący, więc przy braku polityki lub błędzie Storage plik może zostać. To jest właściwe zachowanie dla UX, ale trzeba monitorować bucket.

Data consistency:
- Favorites mają `on delete cascade` do `listings`, więc usunięcie ogłoszenia powinno sprzątać powiązane ulubione.
- Zmiana statusu w `account` i `edit listing` używa istniejącego `status`.
- Client-side filtering pobiera wszystkie listingi i filtruje w przeglądarce. Dla MVP OK, ale przy większej liczbie ogłoszeń będzie wymagało server-side search lub paginacji.

## UX/content risks

Search:
- Dobrze: hero search jest uproszczony do jednego `q`, popularne tagi używają `q`, a panel wyników ma filtry status/brand/dye lot.
- Dobrze: `ListingSearchResults` bezpiecznie obsługuje `null` i `undefined` przez `normalizeSearchText`.
- Ryzyko: edycja wyszukiwania w panelu wyników nie aktualizuje URL. To jest OK dla MVP, ale tester po odświeżeniu strony wróci do parametrów z wejścia, a nie do ostatniego lokalnego stanu.

Listing flow:
- Dobrze: success state po dodaniu ogłoszenia jest jasny i daje akcje: kolejne ogłoszenie, konto, szczegóły.
- Dobrze: formularze mają checklistę jakości i opcjonalny upload.
- Ryzyko: pola `brand`, `yarnName`, `color`, `dyelot`, `country`, `listingUrl` są wymagane. To jest produktowo sensowne, ale testerzy mogą próbować dodać bardzo niepełne ogłoszenie i trafią na walidację.

Account:
- Dobrze: konto ma sekcje "Moje ogłoszenia" i "Ulubione", loading states, empty states, logout.
- Dobrze: przy pustych stanach są CTA.
- Ryzyko: status change w account jest selectem przy każdym ogłoszeniu. Jest funkcjonalny, ale testerzy mogą przypadkowo zmienić status bez dodatkowego potwierdzenia.

Privacy/content:
- Dobrze: `/privacy` jasno mówi, że to MVP informacyjne, wspomina Google/Supabase auth, dane ogłoszeń i zdjęcia.
- Ryzyko: to nie jest pełna polityka prawna. Dla małej zamkniętej bety OK, ale przed szerszym startem trzeba doprecyzować administratora danych, podstawę kontaktu, retencję i usuwanie danych.

Mobile/accessibility:
- Dobrze: większość przycisków ma `min-h-11` lub większe touch targety.
- Dobrze: formularze mają `label` powiązane z inputami.
- Ryzyko: karty listingów są całe linkiem, a w środku jest przycisk favorite. Kod robi `preventDefault` i `stopPropagation`, co jest potrzebne, ale warto ręcznie przetestować klawiaturą i screen readerem.
- Ryzyko: `FavoriteButton` ma tylko `sr-only` status dla komunikatu logowania, a potem przekierowuje do `/account`. Wizualnie niezalogowany użytkownik może nie zauważyć powodu przekierowania.

## Pre-beta checklist

- [ ] Zastosować w Supabase SQL Editor migrację `20260702000000_add_listing_images_delete_policy.sql`, jeśli jeszcze nie została zastosowana.
- [ ] Ręcznie potwierdzić RLS dla `listings`: public select, owner insert/update/delete.
- [ ] Naprawić błędy z `npm run lint` albo świadomie zaakceptować je na małą rundę testów.
- [ ] Ujednolicić linki PL, żeby użytkownik wracał na `/`, `/about`, `/#listings`, a nie na `/pl`.
- [ ] Sprawdzić ręcznie na produkcji `https://dyeloty.pl/`: hero search, popular tag, clear search, favorite, add listing, edit listing, delete listing.
- [ ] Przetestować Google login na telefonie w trybie prywatnym lub na koncie testowym.
- [ ] Dodać 2-3 testowe ogłoszenia z różnymi statusami: dostępne, zarezerwowane, sprzedane.
- [ ] Dodać minimum jedno ogłoszenie bez zdjęcia i jedno ze zdjęciem.
- [ ] Sprawdzić usunięcie ogłoszenia ze zdjęciem i zweryfikować, czy Storage cleanup działa.
- [ ] Sprawdzić linki zewnętrzne do Vinted/OLX w szczegółach ogłoszenia.
- [ ] Przejrzeć `/privacy`, `/about`, header i footer na mobile.
- [ ] Przygotować krótką instrukcję dla testerów: co sprawdzić, jak zgłosić feedback, że ogłoszenia mogą być testowe.

## Recommended next sprint

Sprint: Pre-beta cleanup and trust polish.

Maksymalnie 5 zadań:

1. Ujednolicić routing/linki PL na kanoniczne `/` i `/about`, bez legacy `/pl` w głównych CTA.
2. Naprawić błędy `npm run lint` i zostawić lint jako zielony check przed deployem.
3. Dodać `metadataBase`, canonical URL i podstawowy obraz Open Graph dla `https://dyeloty.pl`.
4. Uspokoić UX auth error na `/auth/callback` i dodać jasny przycisk ponownego logowania.
5. Ręcznie zweryfikować Supabase RLS/Storage policies i spisać wynik w krótkiej checkliście operacyjnej.
