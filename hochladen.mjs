// Lädt dist/ per FTPS nach httpdocs auf www.labsupport.at.
//
//   node build.mjs --live && node hochladen.mjs
//
// Zugangsdaten liegen NICHT im Repo, sondern in %USERPROFILE%\.labsupport-ftp
// (netrc-Format, eine Zeile):
//   machine <FTP-Server> login <FTP-Benutzer> password <Passwort>
// Optional weitere Zeilen:
//   # ip <IP-Adresse>      – FTP läuft auf dieser IP, nicht auf der Adresse des
//                            Servernamens; das Zertifikat lautet aber auf den Namen
//   # ordner httpdocs      – anderer Zielordner
//
// Überschreibt gleichnamige Dateien, löscht aber nichts auf dem Server.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { homedir } from "node:os";
import { execFileSync } from "node:child_process";

const WURZEL = import.meta.dirname;
const QUELLE = join(WURZEL, "dist");
const NETRC = join(homedir(), ".labsupport-ftp");

const zugang = readFileSync(NETRC, "utf8");
const server = zugang.match(/machine\s+(\S+)/)?.[1];
const ordner = zugang.match(/#\s*ordner\s+(\S+)/)?.[1] ?? "httpdocs";
const ip = zugang.match(/#\s*ip\s+(\S+)/)?.[1];
if (!server) throw new Error(`Kein "machine <server>" in ${NETRC}`);

const robots = readFileSync(join(QUELLE, "robots.txt"), "utf8");
if (robots.includes("Disallow: /")) throw new Error("dist/ ist die Vorschau – zuerst: node build.mjs --live");

function dateien(pfad) {
  return readdirSync(pfad).flatMap((n) => {
    const p = join(pfad, n);
    return statSync(p).isDirectory() ? dateien(p) : [p];
  });
}

const liste = dateien(QUELLE);
for (const [i, datei] of liste.entries()) {
  const ziel = relative(QUELLE, datei).split("\\").join("/");
  execFileSync("curl", [
    "--silent", "--show-error", "--fail",
    "--ssl-reqd", "--ftp-create-dirs",
    "--netrc-file", NETRC,
    ...(ip ? ["--connect-to", `${server}:21:${ip}:21`] : []),
    "--upload-file", datei,
    `ftp://${server}/${ordner}/${ziel}`,
  ], { stdio: ["ignore", "ignore", "inherit"] });
  console.log(`${i + 1}/${liste.length}  ${ziel}`);
}
console.log(`fertig: ${liste.length} Dateien nach ${server}/${ordner}`);
