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

async function loadJson<T>(filename: string): Promise<T> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/${filename}`);

  if (!response.ok) {
    throw new Error(`${filename}: HTTP ${response.status}`);
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
    loadJson<CaseInfo>("case.json"),
    loadJson<Evidence[]>("evidence.json"),
    loadJson<Person[]>("people.json"),
    loadJson<Location[]>("locations.json"),
    loadJson<TimelineEvent[]>("timeline.json"),
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
