// Exercise 6 – Demo 4: Minimales, schreibgeschuetztes Backend (nur Entwicklung).
// Startet mit: npm run server   (laeuft auf http://localhost:3001)
//
// Endpunkte (nur GET):
//   /api/case  /api/evidence  /api/people  /api/locations  /api/timeline
//
// Simulation fuer spaetere Demos (an jedem Endpunkt):
//   ?delay=2000   Antwort kommt erst nach 2000 ms (Demo 6/7)
//   ?fail=1       Antwort ist ein HTTP 500 (Demo 6)
//   ?empty=1      erfolgreiche Antwort, aber ohne Eintraege (Demo 6)
// Standard-Verzoegerung fuer alle Anfragen: Umgebungsvariable API_DELAY (ms).

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const PORT = Number(process.env.PORT ?? 3001);
const DEFAULT_DELAY = Number(process.env.API_DELAY ?? 0);

// Dieselben Dateien, die das Frontend bisher statisch geladen hat.
const DATA_DIR = new URL("../public/data/", import.meta.url);

// Ressourcenname in der URL -> JSON-Datei
const RESOURCES = {
  case: "case.json",
  evidence: "evidence.json",
  people: "people.json",
  locations: "locations.json",
  timeline: "timeline.json",
};

function sendJson(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const match = url.pathname.match(/^\/api\/([a-z]+)\/?$/);
  const filename = match ? RESOURCES[match[1]] : undefined;

  console.log(`${request.method} ${url.pathname}${url.search}`);

  if (!filename) {
    sendJson(response, 404, { error: `Unknown endpoint: ${url.pathname}` });
    return;
  }

  // Schreibgeschuetzt: alles ausser GET wird abgelehnt.
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    sendJson(response, 405, { error: "Only GET is supported" });
    return;
  }

  const delay = Number(url.searchParams.get("delay") ?? DEFAULT_DELAY);
  if (delay > 0) {
    await wait(delay);
  }

  if (url.searchParams.get("fail") === "1") {
    sendJson(response, 500, { error: "Simulated server error" });
    return;
  }

  try {
    const data = JSON.parse(await readFile(new URL(filename, DATA_DIR), "utf8"));

    if (url.searchParams.get("empty") === "1") {
      // Gleiche Form, aber leer: Arrays werden zu [], case.json bleibt ein Objekt.
      sendJson(response, 200, Array.isArray(data) ? [] : {});
      return;
    }

    sendJson(response, 200, data);
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: "Could not read data file" });
  }
});

server.listen(PORT, () => {
  console.log(`Mock API (dev only) running on http://localhost:${PORT}/api`);
  if (DEFAULT_DELAY > 0) {
    console.log(`Default delay: ${DEFAULT_DELAY} ms`);
  }
});
