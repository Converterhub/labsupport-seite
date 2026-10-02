// Kopf, Menü, Einblenden, Sprungleiste und das Anfrageformular.
// Ohne JavaScript bleibt alles lesbar — hier wird nur verfeinert.

document.documentElement.classList.add("js");

const kopf = document.querySelector("[data-kopf]");
const schalter = document.querySelector("[data-navi-schalter]");
const navi = document.getElementById("navi");

const handyleiste = document.querySelector("[data-handyleiste]");

function kopfPruefen() {
  kopf?.classList.toggle("kopf--fest", window.scrollY > 8);
  handyleiste?.classList.toggle("handyleiste--da", window.scrollY > window.innerHeight * 0.7);
}
kopfPruefen();
window.addEventListener("scroll", kopfPruefen, { passive: true });

schalter?.addEventListener("click", () => {
  const offen = schalter.getAttribute("aria-expanded") === "true";
  schalter.setAttribute("aria-expanded", String(!offen));
  navi.classList.toggle("navi--offen", !offen);
});
navi?.addEventListener("click", (e) => {
  if (e.target.closest("a")) {
    schalter?.setAttribute("aria-expanded", "false");
    navi.classList.remove("navi--offen");
  }
});

// Einblenden beim Scrollen
const zeigen = document.querySelectorAll("[data-zeige]");
if ("IntersectionObserver" in window) {
  const beobachter = new IntersectionObserver(
    (eintraege) => {
      for (const e of eintraege) {
        if (e.isIntersecting) {
          e.target.classList.add("sichtbar");
          beobachter.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px" }
  );
  zeigen.forEach((el) => beobachter.observe(el));
} else {
  zeigen.forEach((el) => el.classList.add("sichtbar"));
}

// Sprungleiste: den gerade sichtbaren Abschnitt markieren
const sprungpunkte = [...document.querySelectorAll(".sprungleiste a")];
if (sprungpunkte.length && "IntersectionObserver" in window) {
  const ziele = sprungpunkte.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const leiste = new IntersectionObserver(
    (eintraege) => {
      for (const e of eintraege) {
        if (!e.isIntersecting) continue;
        sprungpunkte.forEach((a) => a.classList.toggle("aktiv", a.getAttribute("href") === "#" + e.target.id));
      }
    },
    { rootMargin: "-30% 0px -60% 0px" }
  );
  ziele.forEach((z) => leiste.observe(z));
}

// Anfrageformular: öffnet das Mailprogramm mit vorbereiteter Nachricht
const formular = document.querySelector("[data-anfrage]");
const thema = new URLSearchParams(location.search).get("thema");
if (formular && thema) {
  const auswahl = formular.querySelector("[name=thema]");
  if ([...auswahl.options].some((o) => o.value === thema)) auswahl.value = thema;
}
formular?.addEventListener("submit", (e) => {
  e.preventDefault();
  const d = new FormData(formular);
  const betreff = `Anfrage: ${d.get("thema")}${d.get("firma") ? " – " + d.get("firma") : ""}`;
  const text = [
    d.get("nachricht"),
    "",
    "—",
    `Name: ${d.get("name")}`,
    d.get("firma") ? `Unternehmen: ${d.get("firma")}` : "",
    `E-Mail: ${d.get("mail")}`,
    d.get("telefon") ? `Telefon: ${d.get("telefon")}` : "",
  ].filter((z) => z !== null).join("\n");
  location.href = `mailto:office@labsupport.at?subject=${encodeURIComponent(betreff)}&body=${encodeURIComponent(text)}`;
});
