// Baut die statische Seite: jede Datei in seiten/ bekommt Kopf, Navigation
// und Fußzeile und landet fertig in dist/. Kein Framework, keine Abhängigkeit.
//
//   node build.mjs
//
// Kopf jeder Seitendatei, erste Zeile:
//   <!-- titel: … | beschreibung: … | bereich: … -->

import { readFileSync, writeFileSync, readdirSync, mkdirSync, cpSync, rmSync } from "node:fs";
import { join } from "node:path";

const WURZEL = import.meta.dirname;
const ZIEL = join(WURZEL, "dist");

// Die sechs Bereiche: Hauptmenü, Handyleiste unter dem Kopf und die
// Übersicht im Auftakt der Startseite ({{bereiche}}) kommen alle von hier.
const NAVIGATION = [
  { href: "gmp-analytik.html", text: "GMP & Analytik", bereich: "gmp", stichwort: "Qualifizierung · CSV · Service" },
  { href: "gasgeneratoren.html", text: "Gasgeneratoren", bereich: "gase", stichwort: "N₂ · H₂ · synthetische Luft" },
  { href: "luftaufbereitung.html", text: "Luftaufbereitung", bereich: "luft", stichwort: "Filter · Trockner · Kondensat" },
  { href: "smc-ionisation.html", text: "Ionisation", bereich: "smc", stichwort: "SMC Ionisatoren & Stäbe" },
  { href: "kuehlung.html", text: "Kühlung", bereich: "kuehlung", stichwort: "ATC Kühler · Hexid" },
  { href: "service.html", text: "Service", bereich: "service", stichwort: "Wartung · Diagnose · Ersatzteile" },
];

const esc = (t) => t.replace(/&/g, "&amp;");

function bereichsuebersicht() {
  const kacheln = NAVIGATION.map((p, i) => `
      <a class="uebersicht__punkt" href="${p.href}">
        <span class="uebersicht__nr">0${i + 1}</span>
        <span class="uebersicht__name">${esc(p.text)}</span>
        <span class="uebersicht__stichwort">${esc(p.stichwort)}</span>
      </a>`).join("");
  return `<nav class="uebersicht" aria-label="Unsere Bereiche">${kacheln}
    </nav>`;
}

function kopfdaten(quelle) {
  const treffer = quelle.match(/^<!--([\s\S]*?)-->/);
  const daten = {};
  if (treffer) {
    for (const teil of treffer[1].split("|")) {
      const [schluessel, ...rest] = teil.split(":");
      daten[schluessel.trim()] = rest.join(":").trim();
    }
  }
  return { daten, inhalt: quelle.replace(/^<!--[\s\S]*?-->\s*/, "") };
}

function kopf(bereich) {
  const punkte = NAVIGATION.map(
    (p) => `<a href="${p.href}"${p.bereich === bereich ? ' aria-current="page"' : ""}>${p.text}</a>`
  ).join("");
  return `
<header class="kopf" data-kopf>
  <div class="kopf__innen">
    <a class="marke" href="index.html" aria-label="LabSupport – Startseite">
      <span class="marke__zeichen" aria-hidden="true"></span>
      <span class="marke__name">Lab<b>Support</b></span>
    </a>
    <nav class="navi" id="navi" aria-label="Hauptnavigation">
      ${punkte}
      <a class="knopf knopf--klein" href="kontakt.html">Anfrage stellen</a>
    </nav>
    <button class="navi-schalter" type="button" aria-controls="navi" aria-expanded="false" data-navi-schalter>
      <span></span><span></span><span class="unsichtbar">Menü</span>
    </button>
  </div>
  <nav class="bereichsleiste" aria-label="Bereiche">
    <div class="bereichsleiste__innen">${NAVIGATION.map((p) => `<a href="${p.href}"${p.bereich === bereich ? ' aria-current="page"' : ""}>${esc(p.text)}</a>`).join("")}</div>
  </nav>
</header>`;
}

const FUSS = `
<footer class="fuss">
  <div class="rahmen fuss__raster">
    <div class="fuss__marke">
      <a class="marke marke--hell" href="index.html">
        <span class="marke__zeichen" aria-hidden="true"></span>
        <span class="marke__name">Lab<b>Support</b></span>
      </a>
      <p>Technische Lösungen für Labor, Industrie &amp; Produktion.</p>
      <p class="fuss__leitsatz">Seit 2012. Österreichweit. Persönlich.</p>
    </div>
    <div>
      <h2 class="fuss__titel">Lösungen</h2>
      <ul>
        <li><a href="gmp-analytik.html">GMP &amp; Analytik</a></li>
        <li><a href="gasgeneratoren.html">Gasgeneratoren</a></li>
        <li><a href="luftaufbereitung.html">Luftaufbereitung</a></li>
        <li><a href="smc-ionisation.html">SMC Ionisation</a></li>
        <li><a href="kuehlung.html">Durchlaufkühler &amp; Hexid</a></li>
        <li><a href="service.html">Service &amp; Wartung</a></li>
      </ul>
    </div>
    <div>
      <h2 class="fuss__titel">Kontakt</h2>
      <address>
        Labsupport GmbH &amp; Co KG<br>
        Hauptstraße 132<br>
        3441 Baumgarten am Tullnerfeld<br>
        <a href="mailto:office@labsupport.at">office@labsupport.at</a>
      </address>
    </div>
    <div>
      <h2 class="fuss__titel">Rechtliches</h2>
      <ul>
        <li><a href="impressum.html">Impressum</a></li>
        <li><a href="https://labsupport.at/wp-content/uploads/2025/03/AGBsLabsupportDE_03112022.pdf">AGB</a></li>
        <li><a href="https://labsupport.at/wp-content/uploads/2025/03/DatenschutzerklaerungDE.pdf">Datenschutz</a></li>
      </ul>
    </div>
  </div>
  <div class="rahmen fuss__leiste">
    <span>© ${new Date().getFullYear()} Labsupport GmbH &amp; Co KG</span>
    <span class="mono">GMP &amp; Analytik · Gasgeneratoren · Luftaufbereitung · Ionisation · Kühlung · Service</span>
  </div>
</footer>`;

// Nur auf dem Handy: feste Leiste am unteren Rand, erscheint nach dem Auftakt
const HANDYLEISTE = `
<div class="handyleiste" data-handyleiste>
  <a class="knopf" href="kontakt.html">Anfrage stellen <span class="pfeil" aria-hidden="true">→</span></a>
  <a class="handyleiste__mail" href="mailto:office@labsupport.at" aria-label="E-Mail an office@labsupport.at">
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>
  </a>
</div>`;

function seite({ titel, beschreibung, bereich }, inhalt) {
  const volltitel = titel ? `${titel} · LabSupport` : "LabSupport · Technische Lösungen für Labor, Industrie & Produktion";
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${volltitel}</title>
<meta name="description" content="${beschreibung ?? ""}">
<meta name="theme-color" content="#120b33">
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="assets/img/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/stil.css">
<script src="assets/seite.js" defer></script>
</head>
<body>
<a class="sprung" href="#inhalt">Zum Inhalt</a>
${kopf(bereich)}
<main id="inhalt">
${inhalt}
</main>
${FUSS}
${bereich === "kontakt" ? "" : HANDYLEISTE}
</body>
</html>
`;
}

rmSync(ZIEL, { recursive: true, force: true });
mkdirSync(ZIEL, { recursive: true });
cpSync(join(WURZEL, "assets"), join(ZIEL, "assets"), { recursive: true });
// Solange die Seite eine Vorschau ist, bleibt sie aus dem Suchindex –
// sonst stünde sie neben labsupport.at in Google. Zum Freischalten löschen.
cpSync(join(WURZEL, "vercel.json"), join(ZIEL, "vercel.json"));
writeFileSync(join(ZIEL, "robots.txt"), "User-agent: *\nDisallow: /\n");

for (const datei of readdirSync(join(WURZEL, "seiten"))) {
  if (!datei.endsWith(".html")) continue;
  const { daten, inhalt } = kopfdaten(readFileSync(join(WURZEL, "seiten", datei), "utf8"));
  writeFileSync(join(ZIEL, datei), seite(daten, inhalt.replace("{{bereiche}}", bereichsuebersicht())));
  console.log("gebaut:", datei);
}
