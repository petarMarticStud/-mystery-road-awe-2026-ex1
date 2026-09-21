import { state } from "./state.js";

function showLoadingOverlay(message) { const overlay = document.getElementById("loadingOverlay"); const text = document.getElementById("loadingText"); if (text) text.textContent = message; if (overlay) overlay.classList.remove("hidden"); }
function hideLoadingStep() { state.loadingStepsRemaining--; if (state.loadingStepsRemaining <= 0) { const overlay = document.getElementById("loadingOverlay"); if (overlay) overlay.classList.add("hidden"); } }



async function loadEvidenceData(onEvidence) {
  try {
  const evidenceResponse = await fetch("data/evidence.json");
  const evidenceData = await evidenceResponse.json();

  state.allEvidence = evidenceData;
  state.filteredEvidence = [... state.allEvidence];
  onEvidence();


} 
catch (error) { console.error("Error loading evidence data:", error); }
}

async function loadTimelineData(onTimeline) {
  try {
    const response =
      await fetch("data/timeline.json");

    state.allTimeline =
      await response.json();

    onTimeline();

  } catch (error) {
    console.log(
      "timeline load error",
      error
    );
  } finally {
    hideLoadingStep();
  }
}



export async function loadAllData(onCoreData, onEvidence, onTimeline) {
  state.allPeople = await peopleResponse.json();
  
  const locationsResponse = await fetch("data/locations.json")
  state.allLocations = await locationsResponse.json();

  hideLoadingStep(); onCoreData();

  loadEvidenceData(onEvidence);
  loadTimelineData(onTimeline);
}
