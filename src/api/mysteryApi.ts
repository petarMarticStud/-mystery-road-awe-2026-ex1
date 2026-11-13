import type {
  Evidence,
  Location,
  Person,
  TimelineEvent,
} from "../../modules/domain";

// Exercise 6 – Demo 9: API-Schicht.
// Die EINZIGE Stelle der React-App, die fetch aufruft. Sie kennt die URLs des
// Backends, die Query-Parameter und die Form der Antworten, sonst nichts:
// kein React, kein State, kein Ladezustand.

const BASE_URL = "/api";

// Form der Antwort von GET /api/case
export interface CaseInfo {
  title: string;
  status: string;
  summary: string;
}

// Simulation im Backend (Demo 4): ?delay=…, ?fail=1, ?empty=1.
// Nur hier steht, wie diese Parameter heissen.
export interface Simulate {
  delayMs?: number;
  fail?: boolean;
  empty?: boolean;
}

export interface RequestOptions {
  // Demo 7: Signal vom AbortController, damit die Anfrage abgebrochen werden kann.
  signal?: AbortSignal;
  simulate?: Simulate;
}

function buildQuery(simulate: Simulate = {}): string {
  const params = new URLSearchParams();
  if (simulate.delayMs) params.set("delay", String(simulate.delayMs));
  if (simulate.fail) params.set("fail", "1");
  if (simulate.empty) params.set("empty", "1");
  const query = params.toString();
  return query === "" ? "" : `?${query}`;
}

async function getJson<T>(
  resource: string,
  { signal, simulate }: RequestOptions = {},
): Promise<T> {
  const response = await fetch(
    `${BASE_URL}/${resource}${buildQuery(simulate)}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error(`The server answered with HTTP ${response.status}.`);
  }

  return (await response.json()) as T;
}

// Eine Funktion pro Endpunkt. Komponenten und Hooks kennen nur diese Namen, keine URLs.
export function fetchCase(options?: RequestOptions) {
  return getJson<CaseInfo>("case", options);
}

export function fetchEvidence(options?: RequestOptions) {
  return getJson<Evidence[]>("evidence", options);
}

export function fetchPeople(options?: RequestOptions) {
  return getJson<Person[]>("people", options);
}

export function fetchLocations(options?: RequestOptions) {
  return getJson<Location[]>("locations", options);
}

export function fetchTimeline(options?: RequestOptions) {
  return getJson<TimelineEvent[]>("timeline", options);
}
