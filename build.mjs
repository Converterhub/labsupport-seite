// Baut die statische Seite: jede Datei in seiten/ bekommt Kopf, Navigation
// und Fußzeile und landet fertig in dist/. Kein Framework, keine Abhängigkeit.
//
//   node build.mjs          → Vorschau für GitHub Pages (gesperrt für Suchmaschinen)
//   node build.mjs --live   → für www.labsupport.at (indexierbar, mit web.config)
//
// Kopf jeder Seitendatei, erste Zeile:
//   <!-- titel: … | beschreibung: … | bereich: … -->
//
// Deutsch liegt in seiten/, Englisch in seiten/en/ (gleiche Dateinamen) und
// landet in dist/en/. Der Sprachumschalter im Kopf führt jeweils zur
// gleichnamigen Seite der anderen Sprache.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, cpSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const WURZEL = import.meta.dirname;
const ZIEL = join(WURZEL, "dist");
const LIVE = process.argv.includes("--live");

// Abschnitt „Hosting“ der Datenschutzerklärung ({{hosting}}): hängt davon ab,
// wo die Seite liegt. Den Hoster von labsupport.at erst namentlich nennen,
// wenn Name und Anschrift bestätigt sind.
const HOSTING = {
  vorschau: {
    de: `<p>Diese Website wird über GitHub Pages bereitgestellt, einen Dienst der GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA. Beim Aufruf der Seite verarbeitet GitHub technisch notwendige Daten, insbesondere Ihre IP-Adresse, Datum und Uhrzeit des Zugriffs, die aufgerufene Seite sowie Angaben zu Browser und Betriebssystem. Diese Daten dienen ausschließlich der sicheren und stabilen Auslieferung der Website.</p>
      <p>Rechtsgrundlage ist unser berechtigtes Interesse an einem sicheren und funktionsfähigen Webauftritt (Art. 6 Abs. 1 lit. f DSGVO). Dabei kann es zu einer Übermittlung in die USA kommen. Diese erfolgt auf Grundlage des EU-US Data Privacy Framework bzw. der Standardvertragsklauseln der EU-Kommission. Näheres in der <a href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">Datenschutzerklärung von GitHub</a>.</p>`,
    en: `<p>This website is provided via GitHub Pages, a service of GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA. When you access the site, GitHub processes technically necessary data, in particular your IP address, the date and time of access, the page accessed and information about your browser and operating system. This data is used solely for the secure and stable delivery of the website.</p>
      <p>The legal basis is our legitimate interest in a secure and functional web presence (Art. 6(1)(f) GDPR). This may involve a transfer of data to the USA. Such transfers take place on the basis of the EU-US Data Privacy Framework or the standard contractual clauses of the European Commission. For further details, see the <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">GitHub privacy statement</a>.</p>`,
  },
  live: {
    de: `<p>Diese Website wird auf dem Webserver eines externen Hosting-Dienstleisters betrieben. Beim Aufruf der Seite verarbeitet der Server technisch notwendige Daten, insbesondere Ihre IP-Adresse, Datum und Uhrzeit des Zugriffs, die aufgerufene Seite sowie Angaben zu Browser und Betriebssystem. Diese Daten dienen ausschließlich der sicheren und stabilen Auslieferung der Website.</p>
      <p>Rechtsgrundlage ist unser berechtigtes Interesse an einem sicheren und funktionsfähigen Webauftritt (Art. 6 Abs. 1 lit. f DSGVO).</p>`,
    en: `<p>This website is operated on the web server of an external hosting provider. When you access the site, the server processes technically necessary data, in particular your IP address, the date and time of access, the page accessed and information about your browser and operating system. This data is used solely for the secure and stable delivery of the website.</p>
      <p>The legal basis is our legitimate interest in a secure and functional web presence (Art. 6(1)(f) GDPR).</p>`,
  },
};

// Die sechs Bereiche: Hauptmenü, Handyleiste unter dem Kopf und die
// Übersicht im Auftakt der Startseite ({{bereiche}}) kommen alle von hier.
// Service steht vorne. Herstellernamen gehören nicht in die Stichworte –
// die Partner stehen gesammelt auf der Startseite.
const NAVIGATION = [
  { href: "service.html", bereich: "service",
    de: { text: "Service und Reparatur", stichwort: "Wartung & Betreuung vor Ort" },
    en: { text: "Service & Repair", stichwort: "On-site maintenance & support" } },
  { href: "gmp-analytik.html", bereich: "gmp",
    de: { text: "Qualifizierung & CSV", stichwort: "Qualifizierung · CSV · Beratung" },
    en: { text: "Qualification & CSV", stichwort: "Qualification · CSV · Consulting" } },
  { href: "gasgeneratoren.html", bereich: "gase",
    de: { text: "Gasgeneratoren", stichwort: "N₂ · H₂ · synthetische Luft" },
    en: { text: "Gas Generators", stichwort: "N₂ · H₂ · synthetic air" } },
  { href: "luftaufbereitung.html", bereich: "luft",
    de: { text: "Luftaufbereitung", stichwort: "Filter · Trockner · Kondensat" },
    en: { text: "Compressed Air", stichwort: "Filters · Dryers · Condensate" } },
  { href: "smc-ionisation.html", bereich: "smc",
    de: { text: "Ionisation", stichwort: "Ionisatoren · Stäbe · Düsen" },
    en: { text: "Ionisation", stichwort: "Ionisers · Bars · Nozzles" } },
  { href: "kuehlung.html", bereich: "kuehlung",
    de: { text: "Kühlung", stichwort: "Durchlaufkühler · Kühlflüssigkeit" },
    en: { text: "Cooling", stichwort: "Chillers · Coolant" } },
];

// Feste Texte von Kopf, Fußzeile und Handyleiste je Sprache
const TEXTE = {
  de: {
    titel: "LabSupport · Technische Lösungen für Labor, Industrie & Produktion",
    sprung: "Zum Inhalt",
    startseite: "LabSupport – Startseite",
    hauptnavigation: "Hauptnavigation",
    bereiche: "Bereiche",
    unsereBereiche: "Unsere Bereiche",
    anfrage: "Anfrage stellen",
    menue: "Menü",
    naviFuss: "Österreich &amp; Europa · seit 2012",
    sprache: "Sprache",
    claim: "Technische Lösungen für Labor, Industrie &amp; Produktion.",
    leitsatz: "Lösungen für Labor &amp; GMP<br>Geräte · Service/Wartung · Qualifizierung/CSV",
    loesungen: "Lösungen",
    fussLoesungen: ["Service und Reparatur vor Ort", "Qualifizierung &amp; CSV", "Gasgeneratoren", "Luftaufbereitung", "Ionisation", "Durchlaufkühler &amp; Kühlflüssigkeit"],
    kontakt: "Kontakt",
    land: "",
    rechtliches: "Rechtliches",
    impressum: "Impressum",
    agb: "AGB",
    datenschutz: "Datenschutz",
    ohneCookies: "Keine Cookies · kein Tracking",
    leiste: "Service und Reparatur · Qualifizierung &amp; CSV · Gasgeneratoren · Luftaufbereitung · Ionisation · Kühlung",
    mailLabel: "E-Mail an office@labsupport.at",
  },
  en: {
    titel: "LabSupport · Technical solutions for laboratory, industry & production",
    sprung: "Skip to content",
    startseite: "LabSupport – Home",
    hauptnavigation: "Main navigation",
    bereiche: "Areas",
    unsereBereiche: "Our areas",
    anfrage: "Send enquiry",
    menue: "Menu",
    naviFuss: "Austria &amp; Europe · since 2012",
    sprache: "Language",
    claim: "Technical solutions for laboratory, industry &amp; production.",
    leitsatz: "Solutions for laboratory &amp; GMP<br>Instruments · Service/Maintenance · Qualification/CSV",
    loesungen: "Solutions",
    fussLoesungen: ["On-site service &amp; repair", "Qualification &amp; CSV", "Gas generators", "Compressed air treatment", "Ionisation", "Chillers &amp; coolant"],
    kontakt: "Contact",
    land: "<br>Austria",
    rechtliches: "Legal",
    impressum: "Legal notice",
    agb: "Terms and conditions",
    datenschutz: "Privacy policy",
    ohneCookies: "No cookies · no tracking",
    leiste: "Service &amp; repair · Qualification &amp; CSV · Gas generators · Compressed air · Ionisation · Cooling",
    mailLabel: "Email office@labsupport.at",
  },
};

const esc = (t) => t.replace(/&/g, "&amp;");

function bereichsuebersicht(sprache) {
  const kacheln = NAVIGATION.map((p, i) => `
      <a class="uebersicht__punkt" href="${p.href}">
        <span class="uebersicht__nr">0${i + 1}</span>
        <span class="uebersicht__name">${esc(p[sprache].text)}</span>
        <span class="uebersicht__stichwort">${esc(p[sprache].stichwort)}</span>
      </a>`).join("");
  return `<nav class="uebersicht" aria-label="${TEXTE[sprache].unsereBereiche}">${kacheln}
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

// Dieselbe Seite in beiden Sprachen, relativ zur aktuellen. Fehlt die
// Übersetzung, führt der Umschalter zur Startseite der anderen Sprache.
function sprachverweise(sprache, datei, hatAndere) {
  const andere = hatAndere ? datei : "index.html";
  return sprache === "de"
    ? { de: datei, en: `en/${andere}` }
    : { de: `../${andere}`, en: datei };
}

function sprachumschalter(sprache, ziel) {
  const punkt = (s, kurz, name) =>
    `<a href="${ziel[s]}" lang="${s}" hreflang="${s}" title="${name}"${s === sprache ? ' aria-current="true"' : ""}>${kurz}</a>`;
  return `<nav class="sprache" aria-label="${TEXTE[sprache].sprache}">${punkt("de", "DE", "Deutsch")}${punkt("en", "EN", "English")}</nav>`;
}

function kopf(sprache, bereich, ziel) {
  const t = TEXTE[sprache];
  // Am Bildschirm nur der Name; im Handymenü dazu die Stichworte
  const punkte = NAVIGATION.map(
    (p) => `<a href="${p.href}"${p.bereich === bereich ? ' aria-current="page"' : ""}><span class="navi__name">${esc(p[sprache].text)}</span><span class="navi__stichwort">${esc(p[sprache].stichwort)}</span></a>`
  ).join("");
  return `
<header class="kopf" data-kopf>
  <div class="kopf__innen">
    <a class="marke" href="index.html" aria-label="${t.startseite}">
      <span class="marke__zeichen" aria-hidden="true"></span>
      <span class="marke__name">Lab<b>Support</b></span>
    </a>
    <nav class="navi" id="navi" aria-label="${t.hauptnavigation}">
      ${punkte}
      <a class="knopf knopf--klein" href="kontakt.html">${t.anfrage}</a>
      <p class="navi__fuss"><a href="mailto:office@labsupport.at">office@labsupport.at</a><span>${t.naviFuss}</span></p>
    </nav>
    ${sprachumschalter(sprache, ziel)}
    <button class="navi-schalter" type="button" aria-controls="navi" aria-expanded="false" data-navi-schalter>
      <span></span><span></span><span class="unsichtbar">${t.menue}</span>
    </button>
  </div>
  <nav class="bereichsleiste" aria-label="${t.bereiche}">
    <div class="bereichsleiste__innen">${NAVIGATION.map((p) => `<a href="${p.href}"${p.bereich === bereich ? ' aria-current="page"' : ""}>${esc(p[sprache].text)}</a>`).join("")}</div>
  </nav>
</header>`;
}

function fuss(sprache) {
  const t = TEXTE[sprache];
  return `
<footer class="fuss">
  <div class="rahmen fuss__raster">
    <div class="fuss__marke">
      <a class="marke marke--hell" href="index.html">
        <span class="marke__zeichen" aria-hidden="true"></span>
        <span class="marke__name">Lab<b>Support</b></span>
      </a>
      <p>${t.claim}</p>
      <p class="fuss__leitsatz">${t.leitsatz}</p>
    </div>
    <div>
      <h2 class="fuss__titel">${t.loesungen}</h2>
      <ul>
${NAVIGATION.map((p, i) => `        <li><a href="${p.href}">${t.fussLoesungen[i]}</a></li>`).join("\n")}
      </ul>
    </div>
    <div>
      <h2 class="fuss__titel">${t.kontakt}</h2>
      <address>
        Labsupport GmbH &amp; Co KG<br>
        Hauptstraße 132<br>
        3441 Baumgarten am Tullnerfeld${t.land}<br>
        <a href="mailto:office@labsupport.at">office@labsupport.at</a>
      </address>
    </div>
    <div>
      <h2 class="fuss__titel">${t.rechtliches}</h2>
      <ul>
        <li><a href="impressum.html">${t.impressum}</a></li>
        <li><a href="agb.html">${t.agb}</a></li>
        <li><a href="datenschutz.html">${t.datenschutz}</a></li>
      </ul>
    </div>
  </div>
  <div class="rahmen fuss__leiste">
    <span>© ${new Date().getFullYear()} Labsupport GmbH &amp; Co KG<a class="fuss__hinweis" href="datenschutz.html">${t.ohneCookies}</a></span>
    <span class="mono">${t.leiste}</span>
  </div>
</footer>`;
}

// Nur auf dem Handy: feste Leiste am unteren Rand, erscheint nach dem Auftakt
function handyleiste(sprache) {
  const t = TEXTE[sprache];
  return `
<div class="handyleiste" data-handyleiste>
  <a class="knopf" href="kontakt.html">${t.anfrage} <span class="pfeil" aria-hidden="true">→</span></a>
  <a class="handyleiste__mail" href="mailto:office@labsupport.at" aria-label="${t.mailLabel}">
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>
  </a>
</div>`;
}

function seite(sprache, ziel, hatAndere, { titel, beschreibung, bereich }, inhalt) {
  const t = TEXTE[sprache];
  const a = sprache === "en" ? "../assets/" : "assets/";
  const volltitel = titel ? `${titel} · LabSupport` : t.titel;
  const alternativen = hatAndere
    ? `\n<link rel="alternate" hreflang="de" href="${ziel.de}">\n<link rel="alternate" hreflang="en" href="${ziel.en}">`
    : "";
  return `<!doctype html>
<html lang="${sprache}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${volltitel}</title>
<meta name="description" content="${beschreibung ?? ""}">
<meta name="theme-color" content="#120b33">
${LIVE ? "" : '<meta name="robots" content="noindex, nofollow">\n'}${alternativen.trimStart()}
<link rel="icon" href="${a}img/logo.png">
<link rel="preload" href="${a}schriften/inter-latin-6.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${a}schriften/schriften.css">
<link rel="stylesheet" href="${a}stil.css">
<script src="${a}seite.js" defer></script>
</head>
<body>
<a class="sprung" href="#inhalt">${t.sprung}</a>
${kopf(sprache, bereich, ziel)}
<main id="inhalt">
${inhalt}
</main>
${fuss(sprache)}
${bereich === "kontakt" ? "" : handyleiste(sprache)}
</body>
</html>
`;
}

rmSync(ZIEL, { recursive: true, force: true });
mkdirSync(join(ZIEL, "en"), { recursive: true });
cpSync(join(WURZEL, "assets"), join(ZIEL, "assets"), { recursive: true });
if (LIVE) {
  // www.labsupport.at läuft auf IIS (Plesk): web.config für HTTPS, Startseite und Schriften
  cpSync(join(WURZEL, "web.config"), join(ZIEL, "web.config"));
  writeFileSync(join(ZIEL, "robots.txt"), "User-agent: *\nAllow: /\n");
} else {
  // Die Vorschau bleibt aus dem Suchindex, sonst stünde sie neben labsupport.at in Google
  cpSync(join(WURZEL, "vercel.json"), join(ZIEL, "vercel.json"));
  writeFileSync(join(ZIEL, "robots.txt"), "User-agent: *\nDisallow: /\n");
}

const QUELLEN = { de: join(WURZEL, "seiten"), en: join(WURZEL, "seiten", "en") };
const ANDERE = { de: "en", en: "de" };

for (const sprache of ["de", "en"]) {
  if (!existsSync(QUELLEN[sprache])) continue;
  for (const datei of readdirSync(QUELLEN[sprache])) {
    if (!datei.endsWith(".html")) continue;
    const hatAndere = existsSync(join(QUELLEN[ANDERE[sprache]], datei));
    const ziel = sprachverweise(sprache, datei, hatAndere);
    const { daten, inhalt } = kopfdaten(readFileSync(join(QUELLEN[sprache], datei), "utf8"));
    let text = inhalt
      .replace("{{bereiche}}", bereichsuebersicht(sprache))
      .replace("{{hosting}}", HOSTING[LIVE ? "live" : "vorschau"][sprache]);
    // Die englischen Seiten liegen eine Ebene tiefer
    if (sprache === "en") text = text.replace(/(src|href)="assets\//g, '$1="../assets/');
    const pfad = sprache === "en" ? join(ZIEL, "en", datei) : join(ZIEL, datei);
    writeFileSync(pfad, seite(sprache, ziel, hatAndere, daten, text));
    console.log("gebaut:", sprache === "en" ? `en/${datei}` : datei);
  }
}
