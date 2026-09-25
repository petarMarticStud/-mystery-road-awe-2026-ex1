import { state } from "./state.js";
import {
  saveBookmarks,
  saveNote,
  getNote,
  saveHypothesisDraft,
  loadHypothesisDraft,
} from "./storage.js";
import {
  findEvidenceById,
  findPersonById,
  findLocationById,
  evidenceMentionsPerson,
  formatDate,
  statusBadgeClass,
  relevanceBadgeClass,
} from "./helpers.js";

let navigate = () => {};
export function setNavigator(fn) {
  navigate = fn;
}

export function renderDashboard() {
  const container = document.getElementById("dashboardContent");
  if (!container) return;
  const reviewed = state.allEvidence.filter(
    (item) => (item.status || "").toLowerCase() === "reviewed",
  ).length;
  const progress = state.allEvidence.length
    ? Math.round((reviewed / state.allEvidence.length) * 100)
    : 0;
  const stat = (value, label) =>
    `<div class="stat-card"><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>`;
  let html = `<div class="case-summary-card"><h3>${state.caseData.title || "Case"}</h3><p><span class="badge badge-flagged">${(state.caseData.status || "unknown").toUpperCase()}</span></p><p>${state.caseData.summary || ""}</p></div>`;
  html += `<div class="stat-grid">${stat(state.allEvidence.length, "Evidence items")}${stat(state.allPeople.length, "People")}${stat(state.allLocations.length, "Locations")}${stat(state.bookmarks.length, "Bookmarked")}${stat(reviewed, "Reviewed")}</div>`;
  html += `<div class="dashboard-panel"><h3>Review progress</h3><div class="progress-bar-outer"><div class="progress-bar-inner" style="width:${progress}%;"></div></div><p>${progress}% of evidence reviewed</p></div><div class="dashboard-columns">`;
  html += `<div class="dashboard-panel"><h3>Recent evidence</h3>${
    state.allEvidence
      .slice(-5)
      .reverse()
      .map(
        (ev) =>
          `<div class="mini-list-item"><strong>${ev.id}</strong> &mdash; ${ev.title} <span class="badge ${statusBadgeClass(ev.status)}">${ev.status}</span></div>`,
      )
      .join("") || "<p>No evidence loaded yet.</p>"
  }</div>`;
  html += `<div class="dashboard-panel"><h3>Recent timeline events</h3>${
    state.allTimeline
      .slice(-5)
      .reverse()
      .map(
        (evt) =>
          `<div class="mini-list-item"><strong>${formatDate(evt.time)}</strong><br>${evt.title}</div>`,
      )
      .join("") || "<p>No timeline events loaded yet.</p>"
  }</div></div>`;
  container.innerHTML = html;
}

export function populateAllDropdowns() {
  populateEvidenceDropdowns();
  populateTimelineDropdowns();
  populateHypothesisDropdowns();
}
function populateEvidenceDropdowns() {
  const type = document.getElementById("filterType"),
    person = document.getElementById("filterPerson"),
    location = document.getElementById("filterLocation");
  if (!type || !person || !location) return;
  const types = [
    ...new Set(state.allEvidence.map((item) => item.type.toLowerCase())),
  ];
  type.innerHTML =
    '<option value="">All types</option>' +
    types.map((item) => `<option value="${item}">${item}</option>`).join("");
  person.innerHTML =
    '<option value="">All people</option>' +
    state.allPeople
      .map((item) => `<option value="${item.id}">${item.name}</option>`)
      .join("");
  location.innerHTML =
    '<option value="">All locations</option>' +
    state.allLocations
      .map(
        (item) =>
          `<option value="${item.id}">${item.id} - ${item.name}</option>`,
      )
      .join("");
}
function filteredEvidence() {
  const value = (id) => document.getElementById(id).value;
  const search = (document.getElementById("evidenceSearch").value || "")
      .toLowerCase()
      .trim(),
    type = value("filterType"),
    personId = value("filterPerson"),
    location = value("filterLocation"),
    status = value("filterStatus"),
    relevance = value("filterRelevance");
  state.filteredEvidence = state.allEvidence.filter((item) => {
    const person = personId && findPersonById(personId);
    return (
      (!search ||
        (item.title + " " + item.summary + " " + item.tags.join(" "))
          .toLowerCase()
          .includes(search)) &&
      (!type || item.type.toLowerCase() === type) &&
      (!personId || (person && evidenceMentionsPerson(item, person))) &&
      (!location || item.locationIds.indexOf(location) !== -1) &&
      (!status || (item.status || "").toLowerCase() === status) &&
      (!relevance || (item.relevance || "").toLowerCase() === relevance)
    );
  });
  return state.filteredEvidence;
}
export function renderEvidenceList() {
  const container = document.getElementById("evidenceList"),
    indicator = document.getElementById("evidenceLoadingIndicator");
  if (!container) return;
  if (state.evidenceViewLoading) {
    if (indicator) indicator.classList.remove("hidden");
    container.innerHTML = "";
    return;
  }
  if (indicator) indicator.classList.add("hidden");
  const results = filteredEvidence();
  container.innerHTML = results.length
    ? results.map(evidenceCard).join("")
    : "<p>No evidence matches the current filters.</p>";
}
function evidenceCard(ev) {
  const bookmarked = state.bookmarks.indexOf(ev.id) !== -1;
  return `<div class="evidence-card" data-id="${ev.id}"><button class="bookmark-btn ${bookmarked ? "active" : ""}" data-action="bookmark" data-id="${ev.id}" aria-label="Toggle bookmark for ${ev.title}"><span class="bookmark-icon">${bookmarked ? "★" : "☆"}</span></button><h3>${ev.title}</h3><div class="evidence-meta">${ev.id} &middot; ${ev.type} &middot; ${formatDate(ev.timestamp)}</div><div class="evidence-summary">${ev.summary}</div>${ev.tags.indexOf("critical") !== -1 ? '<span class="badge badge-critical">Critical</span>' : ""}<span class="badge ${statusBadgeClass(ev.status)}">${ev.status}</span><span class="badge ${relevanceBadgeClass(ev.relevance)}">${ev.relevance}</span><div>${ev.tags.map((tag) => `<span class="tag-chip">${tag}</span>`).join("")}</div></div>`;
}
export function handleEvidenceClick(event) {
  const button = event.target.closest("[data-action='bookmark']");
  if (button) {
    event.stopPropagation();
    toggleBookmark(button.dataset.id);
    return;
  }
  const card = event.target.closest(".evidence-card");
  if (card) openEvidenceDetail(card.dataset.id);
}
export function toggleBookmark(id) {
  const evidence = findEvidenceById(id);
  if (!evidence) return;
  if (state.bookmarks.indexOf(id) === -1) {
    state.bookmarks.push(id);
    evidence.bookmarked = true;
  } else {
    state.bookmarks = state.bookmarks.filter((item) => item !== id);
    evidence.bookmarked = false;
  }
  saveBookmarks();
  if (state.currentPage === "evidence") renderEvidenceList();
}
export function applyStoredBookmarkFlags() {
  state.allEvidence.forEach((item) => {
    item.bookmarked = state.bookmarks.indexOf(item.id) !== -1;
  });
}
export function sortEvidence() {
  const sort = document.getElementById("sortEvidence").value,
    compare =
      sort === "title-asc"
        ? (a, b) => a.title.localeCompare(b.title)
        : sort === "title-desc"
          ? (a, b) => b.title.localeCompare(a.title)
          : sort === "date-asc"
            ? (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
            : (a, b) => new Date(b.timestamp) - new Date(a.timestamp);
  state.filteredEvidence.sort(compare);
  renderEvidenceList();
}
export function clearFilters() {
  [
    "evidenceSearch",
    "filterType",
    "filterPerson",
    "filterLocation",
    "filterStatus",
    "filterRelevance",
  ].forEach((id) => {
    document.getElementById(id).value = "";
  });
  renderEvidenceList();
}
export async function handleSearchInput() {
  const requestId = ++state.latestSearchRequestId;
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (requestId === state.latestSearchRequestId) renderEvidenceList();
}

export function openEvidenceDetail(id) {
  const ev = findEvidenceById(id);
  if (!ev) return;
  state.selectedEvidence = ev;
  const section = document.getElementById("evidenceDetailSection");
  section.classList.remove("hidden");
  renderEvidenceDetail(ev);
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}
export function closeEvidenceDetail() {
  const section = document.getElementById("evidenceDetailSection");
  section.classList.add("hidden");
  section.innerHTML = "";
  state.selectedEvidence = null;
}
function option(current, value, label) {
  return `<option value="${value}"${(current || "").toLowerCase() === value ? " selected" : ""}>${label}</option>`;
}
function renderEvidenceDetail(ev) {
  const people = ev.personIds
    .map((id) => {
      const person = findPersonById(id);
      return person ? person.name : id;
    })
    .join(", ");
  const locations = ev.locationIds
    .map((id) => {
      const loc = findLocationById(id);
      return loc ? `${loc.id} - ${loc.name}` : id;
    })
    .join(", ");
  const note = getNote(ev.id);
  document.getElementById("evidenceDetailSection").innerHTML =
    `<div class="evidence-detail-header"><div><h2>${ev.title}</h2><div class="evidence-meta">${ev.id} &middot; ${ev.type} &middot; ${formatDate(ev.timestamp)}</div></div><button type="button" class="btn btn-secondary btn-small" data-close-detail>Close</button></div>${ev.tags.indexOf("critical") !== -1 ? '<div class="warning-banner">This item is tagged as critical evidence.</div>' : ""}<div class="detail-field"><strong>Summary</strong>${ev.summary}</div><div class="evidence-detail-content">${ev.content}</div><div class="detail-field"><strong>Related people</strong>${people}</div><div class="detail-field"><strong>Related locations</strong>${locations}</div><div class="detail-field"><strong>Tags</strong>${ev.tags.map((tag) => `<span class="tag-chip">${tag}</span>`).join("")}</div><div class="detail-field"><strong>Review status</strong><select id="detailStatusSelect">${option(ev.status, "unreviewed", "Unreviewed")}${option(ev.status, "reviewed", "Reviewed")}${option(ev.status, "flagged", "Flagged")}</select></div><div class="detail-field"><strong>Relevance</strong><select id="detailRelevanceSelect">${option(ev.relevance, "unknown", "Unknown")}${option(ev.relevance, "relevant", "Relevant")}${option(ev.relevance, "irrelevant", "Irrelevant")}</select></div><div class="detail-field"><strong>Investigator note</strong><textarea id="evidenceNoteInput" class="note-textarea" rows="3" data-evidence-id="${ev.id}" placeholder="Add a private note about this evidence...">${note}</textarea><button type="button" class="btn btn-primary btn-small" style="margin-top:6px;" data-save-note>Save note</button></div><div class="detail-field"><strong>Note preview</strong><div id="notePreview">${note}</div></div>`;
  document
    .getElementById("detailStatusSelect")
    .addEventListener("change", (e) => {
      ev.status = e.target.value;
      renderEvidenceDetail(ev);
      if (state.viewRendered.evidence) renderEvidenceList();
    });
  document
    .getElementById("detailRelevanceSelect")
    .addEventListener("change", (e) => {
      ev.relevance = e.target.value;
      renderEvidenceDetail(ev);
      if (state.viewRendered.evidence) renderEvidenceList();
    });
}
export function handleDetailClick(event) {
  if (event.target.closest("[data-close-detail]")) closeEvidenceDetail();
  if (event.target.closest("[data-save-note]")) {
    const input = document.getElementById("evidenceNoteInput");
    saveNote(input.dataset.evidenceId, input.value);
    document.getElementById("notePreview").innerHTML = input.value;
  }
}

export function switchPeopleTab(tab) {
  state.currentPeopleTab = tab;
  const people = document.getElementById("peoplePanel"),
    locations = document.getElementById("locationsPanel"),
    peopleButton = document.getElementById("tabPeopleBtn"),
    locationsButton = document.getElementById("tabLocationsBtn");
  people.classList.toggle("hidden", tab !== "people");
  locations.classList.toggle("hidden", tab === "people");
  peopleButton.classList.toggle("active", tab === "people");
  locationsButton.classList.toggle("active", tab !== "people");
}
export function renderPeople() {
  const container = document.getElementById("peoplePanel");
  container.innerHTML = state.allPeople
    .map((person) => {
      const count = state.allEvidence.filter((ev) =>
        evidenceMentionsPerson(ev, person),
      ).length;
      return `<div class="person-card"><div class="person-card-header"><img class="person-avatar" src="${person.avatar}" alt="Portrait of ${person.name}"><div><h3>${person.name}</h3><div class="person-role">${person.role}</div></div></div><p><strong>Speciality:</strong> ${person.speciality}</p><ul>${person.responsibilities.map((item) => `<li>${item}</li>`).join("")}</ul><div class="person-statement">&ldquo;${person.statement}&rdquo;</div><p>${count} related evidence item${count === 1 ? "" : "s"} &mdash; <button type="button" class="evidence-count-link" data-person-id="${person.id}">view</button></p></div>`;
    })
    .join("");
}
export function renderLocations() {
  document.getElementById("locationsPanel").innerHTML = state.allLocations
    .map(
      (loc) =>
        `<div class="location-card"><h3>${loc.id} &mdash; ${loc.name}</h3><p>${loc.description}</p><p><strong>Contains:</strong></p><ul>${loc.contains.map((item) => `<li>${item}</li>`).join("")}</ul></div>`,
    )
    .join("");
}
export function handlePeopleClick(event) {
  const button = event.target.closest("[data-person-id]");
  if (!button) return;
  document.getElementById("filterPerson").value = button.dataset.personId;
  navigate("evidence");
  setTimeout(renderEvidenceList, 0);
}

function populateTimelineDropdowns() {
  const person = document.getElementById("timelinePersonFilter"),
    location = document.getElementById("timelineLocationFilter"),
    type = document.getElementById("timelineTypeFilter");
  if (!person || !location || !type) return;
  person.innerHTML =
    '<option value="">All people</option>' +
    state.allPeople
      .map((item) => `<option value="${item.id}">${item.name}</option>`)
      .join("");
  location.innerHTML =
    '<option value="">All locations</option>' +
    state.allLocations
      .map((item) => `<option value="${item.id}">${item.id}</option>`)
      .join("");
  type.innerHTML =
    '<option value="">All event types</option>' +
    [...new Set(state.allTimeline.map((item) => item.type))]
      .map((item) => `<option value="${item}">${item}</option>`)
      .join("");
}
export function renderTimeline() {
  const container = document.getElementById("timelineContainer");
  if (!container) return;
  const value = (id) => document.getElementById(id).value,
    person = value("timelinePersonFilter"),
    location = value("timelineLocationFilter"),
    type = value("timelineTypeFilter"),
    order = value("timelineOrder");
  const events = state.allTimeline
    .filter(
      (item) =>
        (!person || item.personIds.indexOf(person) !== -1) &&
        (!location || item.locationIds.indexOf(location) !== -1) &&
        (!type || item.type === type),
    )
    .slice()
    .sort(
      (a, b) =>
        (order === "desc" ? -1 : 1) * (new Date(a.time) - new Date(b.time)),
    );
  container.innerHTML = events.length
    ? events
        .map(
          (item) =>
            `<div class="timeline-event certainty-${item.certainty}"><div class="timeline-time">${formatDate(item.time)}&nbsp;&middot;&nbsp;<span class="badge badge-${item.certainty === "confirmed" ? "reviewed" : item.certainty === "contradictory" ? "critical" : item.certainty === "reported" ? "flagged" : "unreviewed"}">${item.certainty}</span></div><h3>${item.title}</h3><p>${item.description}</p><p class="evidence-meta">Location: ${item.locationIds.map((id) => findLocationById(id) || id).join(", ")}</p>${item.evidenceIds.map((id) => `<button type="button" class="evidence-link-btn" data-evidence-id="${id}">View ${id}</button>`).join("")}</div>`,
        )
        .join("")
    : "<p>No timeline events match the current filters.</p>";
}
export function handleTimelineClick(event) {
  const button = event.target.closest("[data-evidence-id]");
  if (button) openEvidenceModal(button.dataset.evidenceId);
}
function openEvidenceModal(id) {
  const ev = findEvidenceById(id);
  if (!ev) return;
  let modal = document.getElementById("quickViewModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "quickViewModal";
    document.body.appendChild(modal);
  }
  modal.innerHTML = `<div class="modal-backdrop"><div class="modal-box"><button type="button" class="modal-close-btn" aria-label="Close">&times;</button><h3>${ev.title}</h3><p class="evidence-meta">${ev.id} &middot; ${ev.type} &middot; ${formatDate(ev.timestamp)}</p><p>${ev.summary}</p><button type="button" class="btn btn-primary btn-small" data-open-full="${ev.id}">Open full evidence</button></div></div>`;
}
export function handleModalClick(event) {
  const modal = document.getElementById("quickViewModal");
  if (!modal) return;
  if (
    event.target.classList.contains("modal-close-btn") ||
    event.target.classList.contains("modal-backdrop")
  )
    modal.innerHTML = "";
  const open = event.target.closest("[data-open-full]");
  if (open) {
    modal.innerHTML = "";
    navigate("evidence");
    setTimeout(() => openEvidenceDetail(open.dataset.openFull), 0);
  }
}

export function renderWorkspace() {
  renderBookmarks();
  renderNotes();
  populateHypothesisDropdowns();
  loadHypothesis();
}
function renderBookmarks() {
  const container = document.getElementById("bookmarksList"),
    items = state.allEvidence.filter((item) => item.bookmarked);
  container.innerHTML = items.length
    ? items
        .map(
          (item) =>
            `<div class="mini-list-item"><strong>${item.id}</strong> &mdash; ${item.title} <button type="button" class="btn btn-small btn-secondary" data-open-workspace-evidence="${item.id}">Open</button></div>`,
        )
        .join("")
    : "<p>No bookmarked evidence yet. Bookmark items from the Evidence view.</p>";
}
function renderNotes() {
  const container = document.getElementById("notesList"),
    entries = state.allEvidence
      .map((item, index) => ({ item, index, text: state.notesStore[item.id] }))
      .filter((item) => item.text);
  container.innerHTML = entries.length
    ? entries
        .map(
          ({ item, index, text }) =>
            `<div class="mini-list-item"><strong>${item.id}</strong> &mdash; ${item.title}<div id="noteText-${index}">${text}</div></div>`,
        )
        .join("")
    : "<p>No notes yet. Add one from an evidence item's detail view.</p>";
}
function populateHypothesisDropdowns() {
  const suspect = document.getElementById("hypSuspect"),
    evidence = document.getElementById("hypEvidence");
  if (!suspect || !evidence) return;
  const current = suspect.value;
  suspect.innerHTML =
    '<option value="">Select a person…</option>' +
    state.allPeople
      .map((item) => `<option value="${item.id}">${item.name}</option>`)
      .join("");
  suspect.value = current;
  evidence.innerHTML = state.allEvidence
    .map(
      (item) =>
        `<option value="${item.id}">${item.id} - ${item.title}</option>`,
    )
    .join("");
}
function selectedOptions(select) {
  return [...select.options]
    .filter((option) => option.selected)
    .map((option) => option.value);
}
export function saveHypothesis() {
  const draft = {
    suspectId: document.getElementById("hypSuspect").value,
    nature: document.getElementById("hypNature").value,
    evidenceIds: selectedOptions(document.getElementById("hypEvidence")),
    confidence: document.getElementById("hypConfidence").value,
    explanation: document.getElementById("hypExplanation").value,
    alternative: document.getElementById("hypAlternative").value,
    savedAt: new Date().toISOString(),
  };
  try {
    saveHypothesisDraft(draft);
  } catch (err) {
    console.error("Could not save hypothesis draft", err);
    alert("Your hypothesis could not be saved to local storage.");
    return;
  }
  const message = document.getElementById("hypothesisSavedMsg");
  message.classList.remove("hidden");
  setTimeout(() => message.classList.add("hidden"), 2000);
}
function loadHypothesis() {
  const draft = loadHypothesisDraft();
  if (!draft) return;
  document.getElementById("hypSuspect").value = draft.suspectId || "";
  document.getElementById("hypNature").value = draft.nature || "";
  document.getElementById("hypConfidence").value = draft.confidence || 50;
  document.getElementById("hypConfidenceValue").textContent =
    draft.confidence || 50;
  document.getElementById("hypExplanation").value = draft.explanation || "";
  document.getElementById("hypAlternative").value = draft.alternative || "";
  [...document.getElementById("hypEvidence").options].forEach((option) => {
    option.selected = (draft.evidenceIds || []).indexOf(option.value) !== -1;
  });
}
export function handleWorkspaceClick(event) {
  const button = event.target.closest("[data-open-workspace-evidence]");
  if (!button) return;
  navigate("evidence");
  setTimeout(() => openEvidenceDetail(button.dataset.openWorkspaceEvidence), 0);
}
