// Macht aus jedem Partnerlogo eine einfarbige Fassung (Indigo und Weiß),
// damit die Logos ohne weiße Kästen auf hellem wie dunklem Grund sitzen.
// Helle Flächen im Logo (z. B. die Buchstaben im ATC-Oval) werden durchsichtig.
//
//   node logos-einfarbig.cjs      (braucht sharp, z. B. aus dem nails-Repo)
const path = require("path");
const sharp = require(process.env.SHARP ?? "sharp");
const ORDNER = path.join(__dirname, "assets/img/partner");
const LOGOS = ["lni.png", "smc.svg", "atc.svg", "agilent.svg", "horiba.svg"];
const FARBEN = { indigo: [45, 27, 140], weiss: [255, 255, 255] };

(async () => {
  for (const datei of LOGOS) {
    const { data, info } = await sharp(path.join(ORDNER, datei), { density: 600 })
      .resize({ height: 144 }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const name = datei.replace(/\.\w+$/, "");
    for (const [farbe, [r, g, b]] of Object.entries(FARBEN)) {
      const aus = Buffer.alloc(data.length);
      for (let i = 0; i < data.length; i += 4) {
        const hell = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
        const deckung = Math.min(1, Math.max(0, (0.9 - hell) / 0.3));
        aus[i] = r; aus[i + 1] = g; aus[i + 2] = b;
        aus[i + 3] = Math.round(data[i + 3] * deckung);
      }
      await sharp(aus, { raw: info }).trim({ threshold: 1 }).png().toFile(path.join(ORDNER, `${name}-${farbe}.png`));
    }
    console.log("einfarbig:", name, info.width + "x" + info.height);
  }
})();
