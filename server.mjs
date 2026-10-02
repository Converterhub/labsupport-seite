// Kleiner Vorschauserver für dist/:  node server.mjs  → http://localhost:4321
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
const TYPEN = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const DIST = join(import.meta.dirname, "dist");
createServer(async (req, res) => {
  let pfad = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (pfad.endsWith("/")) pfad += "index.html";
  try {
    const daten = await readFile(join(DIST, pfad));
    res.writeHead(200, { "content-type": TYPEN[extname(pfad)] ?? "application/octet-stream" }).end(daten);
  } catch { res.writeHead(404).end("nicht gefunden"); }
}).listen(4321, () => console.log("http://localhost:4321"));
