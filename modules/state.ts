import type { Evidence, Location, Person, TimelineEvent } from "./domain.js";

export const state = {
  allEvidence: [] as Evidence[],
  filteredEvidence: [] as Evidence[],
  selectedEvidence: null as Evidence | null,
  bookmarks: [] as string[],
  currentPage: "dashboard",
  allPeople: [] as Person[],
  allLocations: [] as Location[],
  allTimeline: [] as TimelineEvent[],
  caseData: {},
  currentPeopleTab: "people",
  loadingStepsRemaining: 2,
  evidenceViewLoading: false,
  viewRendered: {
    dashboard: false,
    evidence: false,
    people: false,
    timeline: false,
    workspace: false,
  },
  notesStore: {} as Record<string, string>,
  latestSearchRequestId: 0,
};

export const STORAGE_KEYS = {
  bookmarks: "remotion_bookmarks",
  notes: "remotion_notes",
  hypothesis: "remotion_hypothesis",
};
