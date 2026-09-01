import { state } from "./state.js";

function showLoadingOverlay(message) { const overlay = document.getElementById("loadingOverlay"); const text = document.getElementById("loadingText"); if (text) text.textContent = message; if (overlay) overlay.classList.remove("hidden"); }
function hideLoadingStep() { state.loadingStepsRemaining--; if (state.loadingStepsRemaining <= 0) { const overlay = document.getElementById("loadingOverlay"); if (overlay) overlay.classList.add("hidden"); } }

export function loadAllData(onCoreData, onEvidence, onTimeline) {
  showLoadingOverlay("Loading case file…"); state.loadingStepsRemaining = 2;
  return fetch("data/case.json").then(res => res.json()).then(caseJson => {
    state.caseData = caseJson;
    return fetch("data/people.json").then(res => res.json());
  }).then(peopleJson => {
    state.allPeople = peopleJson;
    return fetch("data/locations.json").then(res => res.json());
  }).then(locationsJson => {
    state.allLocations = locationsJson; hideLoadingStep(); onCoreData();
    fetch("data/evidence.json").then(res => res.json()).then(data => { state.allEvidence = data; state.filteredEvidence = state.allEvidence; onEvidence(); }).catch(err => { console.error("Failed to load evidence.json", err); alert("Evidence could not be loaded. Some views may be incomplete."); });
    fetch("data/timeline.json").then(res => res.json()).then(data => { state.allTimeline = data; onTimeline(); }).catch(err => console.log("timeline load error", err)).finally(hideLoadingStep);
  });
}
