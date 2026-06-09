# VYSIO — Note operative GDPR / Cookie

Aggiornamento effettuato: 9 giugno 2026.

## Cosa è stato implementato

- Banner cookie su tutte le pagine con:
  - rifiuto dei cookie non necessari;
  - accettazione di tutte le categorie opzionali;
  - pannello di personalizzazione granulare;
  - categorie opzionali non preselezionate;
  - chiusura con X o tasto Esc equivalente a rifiuto dei cookie non necessari;
  - pulsante persistente “Gestisci cookie” per modificare o revocare la scelta.
- Memorizzazione tecnica della preferenza nel browser tramite `localStorage` con chiave `vysio_cookie_preferences` e durata logica massima di 180 giorni.
- Predisposizione privacy-by-design per bloccare script opzionali prima del consenso.
- Cookie Policy aggiornata con tabella strumenti/categorie, durata, finalità e base.
- Privacy Policy aggiornata con finalità, basi giuridiche, dati trattati, destinatari, trasferimenti, diritti e reclamo al Garante.
- Testo checkbox contatto corretto da consenso generico a presa visione/invio dati per ricontatto.

## Stato attuale del sito

La scansione del codice non ha rilevato Google Analytics, Meta Pixel, iframe, mappe incorporate, CDN, Google Fonts esterni o altri tracker. Il sito usa asset locali e form `mailto:`.

## Come aggiungere in futuro uno script analytics o marketing

Non inserire script analytics/marketing come normali `<script src="...">`, perché partirebbero prima del consenso. Usare invece questo schema:

```html
<script type="text/plain" data-cookie-category="analytics" data-src="https://example.com/analytics.js"></script>
```

Oppure per script inline:

```html
<script type="text/plain" data-cookie-category="marketing">
  // codice marketing qui
</script>
```

Categorie supportate dal gestore attuale:

- `analytics`
- `marketing`

Se in futuro si introducono nuovi fornitori o nuove finalità, aggiornare:

1. `CONSENT_VERSION` in `main.js` per ripresentare il banner;
2. `cookie.html` con nome fornitore, finalità, durata, eventuali terze parti e trasferimenti;
3. `privacy.html` se cambiano finalità, destinatari, basi giuridiche o trasferimenti.

## Limiti

Questa è una messa a norma tecnica e documentale del sito statico sulla base del codice disponibile. Non sostituisce una revisione legale completa dei trattamenti effettivi di Vysio, dei contratti con fornitori email/hosting, del registro trattamenti, delle nomine a responsabile del trattamento e delle misure organizzative interne.
