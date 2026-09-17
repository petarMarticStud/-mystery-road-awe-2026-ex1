export const state = {
  allEvidence: [], filteredEvidence: [], selectedEvidence: null, bookmarks: [],
  currentPage: "dashboard", allPeople: [], allLocations: [], allTimeline: [], caseData: {},
  currentPeopleTab: "people", loadingStepsRemaining: 2, evidenceViewLoading: false,
  viewRendered: { dashboard: false, evidence: false, people: false, timeline: false, workspace: false },
  notesStore: {}, modalCloseListenerCount: 0, latestSearchRequestId: 0
};

export const STORAGE_KEYS = {
  bookmarks: "remotion_bookmarks", notes: "remotion_notes", hypothesis: "remotion_hypothesis"
};
