import type {
  Evidence,
  Person,
  Location,
  TimelineEvent,
} from "../modules/domain";

export interface CaseInfo {
  title: string;
  status: string;
  summary: string;
}

export interface DashboardData {
  caseInfo: CaseInfo;
  evidence: Evidence[];
  people: Person[];
  locations: Location[];
  timeline: TimelineEvent[];
  bookmarks: string[];
}

// Exercise 6 – Demo 5, Task 2: Daten kommen jetzt vom lokalen Backend
// (GET /api/<resource>) statt aus den statischen public/data/*.json-Dateien.
async function loadJson<T>(resource: string): Promise<T> {
  const response = await fetch(`/api/${resource}`);

  if (!response.ok) {
    throw new Error(`${resource}: HTTP ${response.status}`);
  }

  return (await response.json()) as T;
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

export async function loadDashboardData(): Promise<DashboardData> {
  const [caseInfo, evidence, people, locations, timeline] = await Promise.all([
    loadJson<CaseInfo>("case"),
    loadJson<Evidence[]>("evidence"),
    loadJson<Person[]>("people"),
    loadJson<Location[]>("locations"),
    loadJson<TimelineEvent[]>("timeline"),
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
