import { state } from "./modules/state.js";
import { loadBookmarks, loadNotes, loadNoteAsync } from "./modules/storage.js";
import { loadAllData } from "./modules/data.js";
import { setNavigator, renderDashboard, populateAllDropdowns, 
  renderEvidenceList, handleEvidenceClick, applyStoredBookmarkFlags, sortEvidence, 
  clearFilters, handleSearchInput, handleDetailClick, switchPeopleTab, renderPeople, 
  renderLocations, handlePeopleClick, renderTimeline, handleTimelineClick, 
  handleModalClick, renderWorkspace, saveHypothesis, handleWorkspaceClick } from "./modules/views.js";

function navigateTo(viewName) { window.location.hash = viewName; }
function handleHashChange() {
  let hash = window.location.hash.replace("#", ""); const validViews = ["dashboard", "evidence", "people", "timeline", "workspace"];
  if (validViews.indexOf(hash) === -1) hash = "dashboard"; state.currentPage = hash;
  document.querySelectorAll(".view").forEach(section => section.classList.remove("active")); document.getElementById("view-" + hash).classList.add("active");
  document.querySelectorAll(".nav-btn").forEach(button => button.classList.toggle("active", button.dataset.view === hash));
  if (hash === "dashboard" && !state.viewRendered.dashboard) { renderDashboard(); state.viewRendered.dashboard = true; }
  else if (hash === "evidence" && !state.viewRendered.evidence) { renderEvidenceList(); state.viewRendered.evidence = true; }
  else if (hash === "people" && !state.viewRendered.people) { renderPeople(); renderLocations(); state.viewRendered.people = true; }
  else if (hash === "timeline" && !state.viewRendered.timeline) { renderTimeline(); state.viewRendered.timeline = true; }
  else if (hash === "workspace") renderWorkspace();
}
function setupEventListeners() {
  window.addEventListener("hashchange", handleHashChange);
  document.addEventListener("click", event => {
    const navigation = event.target.closest("[data-view]"); if (navigation) {navigateTo(navigation.dataset.view); return; }
    const shortcut = event.target.closest("[data-navigate]"); if (shortcut) { navigateTo(shortcut.dataset.navigate); return; }
    const tab = event.target.closest("[data-people-tab]"); if (tab) { switchPeopleTab(tab.dataset.peopleTab); return; }
    if (event.target.closest("[data-save-hypothesis]")) { saveHypothesis(); return; }
    handleEvidenceClick(event); handleDetailClick(event); handlePeopleClick(event); handleTimelineClick(event); handleModalClick(event); handleWorkspaceClick(event);
  });
  document.getElementById("evidenceSearch").addEventListener("input", handleSearchInput);
  ["filterType", "filterPerson", "filterLocation", "filterStatus", "filterRelevance"].forEach(id => document.getElementById(id).addEventListener("change", renderEvidenceList));
  document.getElementById("sortEvidence").addEventListener("change", sortEvidence); document.getElementById("clearFiltersBtn").addEventListener("click", clearFilters);
  ["timelineOrder", "timelinePersonFilter", "timelineLocationFilter", "timelineTypeFilter"].forEach(id => document.getElementById(id).addEventListener("change", renderTimeline));
  document.getElementById("hypConfidence").addEventListener("input", event => { document.getElementById("hypConfidenceValue").textContent = event.target.value; });
}
function initApp() {
  loadBookmarks(); loadNotes(); setNavigator(navigateTo); setupEventListeners();
  loadAllData(
    () => { renderDashboard(); populateAllDropdowns(); },
    () => { applyStoredBookmarkFlags(); renderDashboard(); populateAllDropdowns(); if (state.currentPage === "evidence") renderEvidenceList(); },
    () => { renderDashboard(); if (state.currentPage === "timeline") renderTimeline(); populateAllDropdowns(); }
  ).then(() => { handleHashChange(); console.log("First note preview:", loadNoteAsync("E01")); });
}
window.addEventListener("DOMContentLoaded", initApp);
