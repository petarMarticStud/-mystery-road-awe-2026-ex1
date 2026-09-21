import { state } from "./modules/state.js";
import { loadBookmarks, loadNotes, loadNoteAsync } from "./modules/storage.js";
import { loadAllData } from "./modules/data.js";
import { setNavigator, renderDashboard, populateAllDropdowns, 
  renderEvidenceList, handleEvidenceClick, applyStoredBookmarkFlags, sortEvidence, 
  clearFilters, handleSearchInput, handleDetailClick, switchPeopleTab, renderPeople, 
  renderLocations, handlePeopleClick, renderTimeline, handleTimelineClick, 
  handleModalClick, renderWorkspace, saveHypothesis, handleWorkspaceClick } from "./modules/views.js";

const viewRenderers = new Map([
  ["dashboard", renderDashboard],
  ["evidence", renderEvidenceList],
  ["people", () => {
    renderPeople();
    renderLocations();
  }],
  ["timeline", renderTimeline],
  ["workspace", renderWorkspace]
]);

function navigateTo(viewName) { window.location.hash = viewName; }
function handleHashChange() {
  const requestedView = window.location.hash.replace("#", "");
  const viewName = viewRenderers.has(requestedView) ? requestedView : "dashboard";
  state.currentPage = viewName;

  document.querySelectorAll(".view").forEach(section => section.classList.remove("active"));
  document.getElementById("view-" + viewName).classList.add("active");
  document.querySelectorAll(".nav-btn").forEach(button => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });

  // Workspace data can change elsewhere, so refresh it on every visit.
  if (viewName === "workspace") {
    renderWorkspace();
  } else if (!state.viewRendered[viewName]) {
    viewRenderers.get(viewName)();
    state.viewRendered[viewName] = true;
  }
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
document.getElementById("hypConfidence").addEventListener("input", event => {document
      .getElementById("hypConfidenceValue")
      .textContent = event.target.value;
  });
}
async function initApp() {
  loadBookmarks(); loadNotes(); setNavigator(navigateTo); setupEventListeners();
  await loadAllData(
    () => { renderDashboard(); populateAllDropdowns(); },
    () => { applyStoredBookmarkFlags(); renderDashboard(); populateAllDropdowns(); if (state.currentPage === "evidence") renderEvidenceList(); },
    () => { renderDashboard(); if (state.currentPage === "timeline") renderTimeline(); populateAllDropdowns(); }
  );
  handleHashChange();
  console.log("First note preview:", await loadNoteAsync("E01"));
}
window.addEventListener("DOMContentLoaded", initApp);
