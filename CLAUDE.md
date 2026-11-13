# LabSupport – Firmenseite

Neue Website der **Labsupport GmbH & Co KG** (Baumgarten am Tullnerfeld), als
Ersatz für labsupport.at. Statisches HTML, kein Framework, keine Abhängigkeit.

**Live:** https://www.labsupport.at/ (seit 13. 11. 2026, Upload per FTP von Hand)
**Vorschau:** https://converterhub.github.io/labsupport-seite/ (jeder Push auf `main`)

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

Die **GitHub-Vorschau bleibt gesperrt für Suchmaschinen** (`noindex` im
Seitenkopf, dazu `robots.txt`, beides in `build.mjs`) – sonst stünde sie
doppelt neben labsupport.at in Google.

### www.labsupport.at

```bash
node build.mjs --live   # indexierbar, mit web.config, Datenschutz ohne GitHub
node hochladen.mjs      # FTPS nach httpdocs, überschreibt, löscht nichts
```

- Server ist **IIS über Plesk** (Windows). HTTPS-Umleitung ist in Plesk
  eingestellt, nicht in der `web.config`.
- `web.config`: **keine zwei Bindestriche in Kommentaren** – ungültiges XML,
  IIS antwortet dann für jede Datei mit 500. Kein `<rewrite>` ohne vorher zu
  prüfen, ob das Modul da ist.
- FTP-Zugang in `%USERPROFILE%\.labsupport-ftp` (nie ins Repo). FTP läuft auf
  einer anderen IP als der Servername, das Zertifikat lautet aber auf den Namen – deshalb
  `# ip` in der Datei.
- Danach live prüfen: Seiten, `assets/stil.css`, die `.woff2`-Schrift und die
  englische Fassung müssen 200 liefern.
- Der Abschnitt „Hosting“ im Datenschutz kommt aus `HOSTING` in `build.mjs`
  (Platzhalter `{{hosting}}`). Den Hoster erst namentlich nennen, wenn Name
  und Anschrift bestätigt sind.

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
| Qualifizierung & CSV (früher GMP & Analytik) | Agilent (Authorized Service Provider), Horiba |
| Gasgeneratoren | **herstellerübergreifend** – aber keine Hersteller nennen, siehe unten |
| Luftaufbereitung | SMC |
| Ionisation | SMC |
| Kühlung | ATC (Durchlaufkühler), Hexid Kühlflüssigkeit – Vertrieb europaweit |

- Die Gasgeneratoren sollen auf der Startseite **herausstechen**.
- **Partner stehen gesammelt im Partnerblock der Startseite**, nicht bei den
  Produkten (Kacheln, Menü, Fußzeile). SMC und LNI Swiss Gas dort als
  **Vertriebspartner**, gleich unter dem Auftakt.
- **Bei den Gasgeneratoren nie einen Hersteller nennen** – weder Namen noch
  Logos, auch nicht in der Beschreibung im Seitenkopf.
- „Herstellerübergreifend“ bei den Generatoren ist erwünscht.
- **Service steht überall an erster Stelle** (Menü, Übersicht, Kacheln) und
  heißt **vor Ort** – man soll sofort sehen, dass LabSupport zu den Kunden
  kommt. Wartung, Reparatur und Kalibrierung **aller** Geräte, auch der
  Analysengeräte, gehören auf die Service-Seite.
- **Qualifizierung & CSV** (Datei `gmp-analytik.html`) umfasst Qualifizierung (DQ/IQ/OQ/PQ), CSV und
  Beratung. Wartung, Reparatur und Kalibrierung der Analysengeräte stehen auf der Service-Seite („Service und Reparatur“), nicht dort.
- Weitere Partner gibt es derzeit nicht.
- **Einsatzgebiet:** in ganz Österreich vor Ort (alle neun Bundesländer) **und
  europaweit im Einsatz** – auch Service. Immer beides nennen, nicht nur eines.

## Datenschutz

Die Seite setzt **keine Cookies**, speichert nichts im Browser und lädt
**nichts von fremden Servern** (Schriften liegen in `assets/schriften/`).
Deshalb braucht sie keinen Cookie-Banner. Wer etwas Fremdes einbaut –
Google Analytics, Google Maps, YouTube, externe Schriften, Chat-Widgets –,
braucht vorher eine Einwilligung der Besucher und muss `seiten/datenschutz.html`
anpassen. Im Zweifel: nicht einbauen, erst mit David klären.

## Inhalte – nichts erfinden

Die Texte stammen von LabSupport. Keine Zahlen, Zertifikate, Kunden oder
technischen Daten hinzudichten. Was ausdrücklich noch offen ist:

- Keine Telefonnummer auf der Seite – auf der alten Seite steht keine.
- Das Anfrageformular öffnet das Mailprogramm (`mailto:` an
  office@labsupport.at), es verschickt nichts selbst.
- Die AGB stehen als eigene Seite (`seiten/agb.html`, Wortlaut aus dem PDF vom 3. 11. 2022,
  das dort weiter verlinkt ist). Am Wortlaut nichts ändern ohne Freigabe.
- Die englische Fassung liegt in `seiten/en/` (gleiche Dateinamen, landet in
  `dist/en/`). Jede Änderung an einer deutschen Seite auch dort nachziehen.
  Kopf-, Menü- und Fußtexte beider Sprachen stehen in `TEXTE` und
  `NAVIGATION` in `build.mjs`. Die englischen AGB sind eine Übersetzung;
  maßgeblich ist die deutsche Fassung (Hinweis auf der Seite).
- Das Auftaktfoto ist ein Symbolbild der alten Seite; ein echtes Foto vom
  Team bei der Arbeit wäre besser.

## Sprache

Texte, Commits, Kommentare und Bezeichner auf Deutsch.
