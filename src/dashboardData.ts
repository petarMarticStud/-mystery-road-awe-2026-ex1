import type {
  Evidence,
  Person,
  Location,
  TimelineEvent,
} from "../modules/domain";

import {
  fetchCase,
  fetchEvidence,
  fetchLocations,
  fetchPeople,
  fetchTimeline,
} from "./api/mysteryApi";
import type { CaseInfo } from "./api/mysteryApi";

// Demo 9: CaseInfo ist die Form einer Backend-Antwort und liegt jetzt in der API-Schicht.
// Weiter-Export, damit bestehende Imports (Dashboard.tsx) unveraendert bleiben.
export type { CaseInfo };

export interface DashboardData {
  caseInfo: CaseInfo;
  evidence: Evidence[];
  people: Person[];
  locations: Location[];
  timeline: TimelineEvent[];
  bookmarks: string[];
}

function loadBookmarks(): string[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem("remotion_bookmarks") ?? "[]",
    );

    if (!Array.isArray(value)) {
      return [];
    }

    const bookmarks: string[] = [];
    for (const item of value) {
      if (typeof item === "string") {
        bookmarks.push(item);
      }
    }
    return bookmarks;
  } catch {
    return [];
  }
}

// Exercise 6 – Demo 9: Kein fetch mehr hier. Die Daten kommen ueber die API-Schicht.
// Diese Datei setzt nur die Antworten zusammen und ergaenzt die Bookmarks (localStorage).
export async function loadDashboardData(
  signal?: AbortSignal,
): Promise<DashboardData> {
  const [caseInfo, evidence, people, locations, timeline] = await Promise.all([
    fetchCase({ signal }),
    fetchEvidence({ signal }),
    fetchPeople({ signal }),
    fetchLocations({ signal }),
    fetchTimeline({ signal }),
  ]);

  return {
    caseInfo,
    evidence,
    people,
    locations,
    timeline,
    bookmarks: loadBookmarks(),
  };
}
