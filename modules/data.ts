import type {
  Evidence,
  Location,
  Person,
  TimelineEvent,
} from "./domain.ts";
import { state } from "./state.js";

function hideLoadingStep() {
  state.loadingStepsRemaining--;
  if (state.loadingStepsRemaining <= 0) {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.classList.add("hidden");
  }
}

async function loadEvidenceData(onEvidence: () => void) {
  try {
    const evidenceResponse = await fetch("data/evidence.json");
    const evidenceData = (await evidenceResponse.json()) as Evidence[];

    state.allEvidence = evidenceData;
    state.filteredEvidence = [...state.allEvidence];
    onEvidence();
  } catch (error) {
    console.error("Error loading evidence data:", error);
  }
}

async function loadTimelineData(onTimeline: () => void) {
  try {
    const response = await fetch("data/timeline.json");

    state.allTimeline = (await response.json()) as TimelineEvent[];

    onTimeline();
  } catch (error) {
    console.log("timeline load error", error);
  } finally {
    hideLoadingStep();
  }
}

export async function loadAllData(
  onCoreData: () => void,
  onEvidence: () => void,
  onTimeline: () => void,
) {
  const peopleResponse = await fetch("data/people.json");
  state.allPeople = (await peopleResponse.json()) as Person[];

  const locationsResponse = await fetch("data/locations.json");
  state.allLocations = (await locationsResponse.json()) as Location[];

  hideLoadingStep();
  onCoreData();

  loadEvidenceData(onEvidence);
  loadTimelineData(onTimeline);
}