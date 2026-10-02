# LabSupport – Firmenseite

Neue Website der **Labsupport GmbH & Co KG** (Baumgarten am Tullnerfeld), als
Ersatz für labsupport.at. Statisches HTML, kein Framework, keine Abhängigkeit.

**Live (Vorschau):** https://converterhub.github.io/labsupport-seite/

## Arbeiten an der Seite

```bash
node build.mjs     # baut seiten/*.html mit Kopf, Menü und Fuß nach dist/
node server.mjs    # Vorschau auf http://localhost:4321 (dient dist/ aus)
```

- **Inhalte** stehen in `seiten/*.html`. Die erste Zeile jeder Datei ist ein
  Kommentar mit `titel`, `beschreibung` und `bereich` (markiert den Menüpunkt).
- **Kopf, Menü, Fußzeile und die Handy-Anfrageleiste** stehen in `build.mjs`,
  nicht in den Seiten. Die sechs Bereiche (Menü, Wischleiste auf dem Handy,
  Übersicht im Auftakt der Startseite über `{{bereiche}}`) kommen alle aus der
  Liste `NAVIGATION` dort.
- **Stil** in `assets/stil.css`, **Verhalten** in `assets/seite.js`.
- `dist/` wird bei jedem Bauen gelöscht und neu erzeugt – nie dort ändern.

## Veröffentlichen

**Jeder Push auf `main` geht automatisch live** – GitHub baut die Seite und
stellt sie auf GitHub Pages (Ablauf `.github/workflows/veroeffentlichen.yml`,
rund eine Minute). Es gibt kein zweites Konto und keinen Schlüssel. Deshalb:

1. **Vor dem Push** bauen und die Seite ansehen – am Bildschirm **und** in
   Handybreite (390 px). Was gepusht ist, ist öffentlich.
2. **Nach dem Push** mit `gh run watch` (oder im Reiter *Actions*) warten, bis
   der Lauf grün ist.
3. **Auf der Live-Seite** ein Merkmal der Änderung suchen, nicht nur den
   Statuscode – 200 liefert auch die alte Fassung.

Arbeiten mehrere gleichzeitig: vor dem Arbeiten `git pull`, nur eigene
Dateien committen, nie `--force` auf `main`.

Die Seite liegt unter einem Unterpfad (`/labsupport-seite/`). Darum **alle
Verweise relativ** (`assets/…`, `kontakt.html`), nie mit führendem `/`.

Das Repo ist **öffentlich** – nur hineinschreiben, was auch auf der Website
stehen dürfte. Keine Zugangsdaten, keine internen Preise, keine privaten
Adressen.

Die Seite ist **noch gesperrt für Suchmaschinen** (`noindex` im Seitenkopf,
dazu `robots.txt`, beides in `build.mjs`). Erst entfernen, wenn
sie labsupport.at wirklich ersetzt – sonst steht sie doppelt in Google.

## Gestaltung – was festgelegt ist

- **Eine Farbfamilie aus dem Logo-Indigo** (`#240A6E`): Indigo/Tinte als
  Grund, Lavendel und Weiß als Akzent. **Kein Cyan oder Hellblau** – genau
  das war der Bruch der alten Seite, und David will es ausdrücklich nicht.
- **Partnerlogos nur einfarbig** (Indigo auf hell, Weiß auf dunkel), nie mit
  weißem Kasten. Neue Logos mit `node logos-einfarbig.cjs` umrechnen
  (braucht `sharp`). Breite Logos optisch angleichen (`--f` in `stil.css`).
- **Fotos im Auftakt als Indigo-Duoton**, damit das LS davor leuchtet.
- Das **LS zeichnet sich im Auftakt selbst** (SVG-Maske entlang der
  Strichmitte, Pfade in `seiten/index.html`). Bei „weniger Bewegung“ steht
  es fertig da.
- **Handy ist keine Nebensache**: eigene Gestaltung, nicht nur Umbruch –
  Wischleisten statt langer Kartenstapel, Bereichsleiste unter dem Kopf,
  feste Anfrageleiste unten.

## Sortiment und Partner – so stimmt es

| Bereich | Partner |
|---|---|
| GMP & Analytik | Agilent (Authorized Service Provider), Horiba |
| Gasgeneratoren | **herstellerübergreifend**, u. a. LNI Swiss Gas und SMC |
| Luftaufbereitung | SMC |
| Ionisation | SMC |
| Kühlung | ATC (Durchlaufkühler), Hexid Kühlflüssigkeit – Vertrieb europaweit |

- Die Gasgeneratoren sollen auf der Startseite **herausstechen**.
- Nie „LNI-Generatoren“ als Überschrift – LabSupport bietet Generatoren
  mehrerer Hersteller.
- Weitere Partner gibt es derzeit nicht.
- **Einsatzgebiet:** in ganz Österreich vor Ort (alle neun Bundesländer) **und
  europaweit im Einsatz** – auch Service. Immer beides nennen, nicht nur eines.

## Inhalte – nichts erfinden

Die Texte stammen von LabSupport. Keine Zahlen, Zertifikate, Kunden oder
technischen Daten hinzudichten. Was ausdrücklich noch offen ist:

- Keine Telefonnummer auf der Seite – auf der alten Seite steht keine.
- Das Anfrageformular öffnet das Mailprogramm (`mailto:` an
  office@labsupport.at), es verschickt nichts selbst.
- AGB und Datenschutz verlinken auf die PDFs der alten Seite.
- Es gibt keine englische Fassung.
- Das Auftaktfoto ist ein Symbolbild der alten Seite; ein echtes Foto vom
  Team bei der Arbeit wäre besser.

## Sprache

Texte, Commits, Kommentare und Bezeichner auf Deutsch.
