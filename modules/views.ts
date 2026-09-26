import { state } from "./state.js";
import type { Evidence } from "./domain.js";
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

type CaseSummary = { title?: string; status?: string; summary?: string };
type EvidenceWithBookmark = Evidence & { bookmarked?: boolean };

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Required element #${id} was not found`);
  return found as T;
}

function control(
  id: string,
): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  const found = document.getElementById(id);
  if (
    found instanceof HTMLInputElement ||
    found instanceof HTMLSelectElement ||
    found instanceof HTMLTextAreaElement
  )
    return found;
  throw new Error(`Required form control #${id} was not found`);
}

function eventElement(event: Event): Element | null {
  return event.target instanceof Element ? event.target : null;
}

let navigate: (viewName: string) => void = () => {};
export function setNavigator(fn: (viewName: string) => void): void {
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
  const caseData = state.caseData as CaseSummary;
  const stat = (value: string | number, label: string) =>
    `<div class="stat-card"><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>`;
  let html = `<div class="case-summary-card"><h3>${caseData.title || "Case"}</h3><p><span class="badge badge-flagged">${(caseData.status || "unknown").toUpperCase()}</span></p><p>${caseData.summary || ""}</p></div>`;
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
  const value = (id: string) => control(id).value;
  const search = (control("evidenceSearch").value || "").toLowerCase().trim(),
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
function evidenceCard(ev: Evidence) {
  const bookmarked = state.bookmarks.indexOf(ev.id) !== -1;
  return `<div class="evidence-card" data-id="${ev.id}"><button class="bookmark-btn ${bookmarked ? "active" : ""}" data-action="bookmark" data-id="${ev.id}" aria-label="Toggle bookmark for ${ev.title}"><span class="bookmark-icon">${bookmarked ? "★" : "☆"}</span></button><h3>${ev.title}</h3><div class="evidence-meta">${ev.id} &middot; ${ev.type} &middot; ${formatDate(ev.timestamp)}</div><div class="evidence-summary">${ev.summary}</div>${ev.tags.indexOf("critical") !== -1 ? '<span class="badge badge-critical">Critical</span>' : ""}<span class="badge ${statusBadgeClass(ev.status)}">${ev.status}</span><span class="badge ${relevanceBadgeClass(ev.relevance)}">${ev.relevance}</span><div>${ev.tags.map((tag) => `<span class="tag-chip">${tag}</span>`).join("")}</div></div>`;
}
export function handleEvidenceClick(event: MouseEvent) {
  const target = eventElement(event);
  if (!target) return;
  const button = target.closest("[data-action='bookmark']");
  if (button) {
    event.stopPropagation();
    const id = button.getAttribute("data-id");
    if (id) toggleBookmark(id);
    return;
  }
  const card = target.closest(".evidence-card");
  const id = card?.getAttribute("data-id");
  if (id) openEvidenceDetail(id);
}
export function toggleBookmark(id: string): void {
  const evidence = findEvidenceById(id);
  if (!evidence) return;
  if (state.bookmarks.indexOf(id) === -1) {
    state.bookmarks.push(id);
    (evidence as EvidenceWithBookmark).bookmarked = true;
  } else {
    state.bookmarks = state.bookmarks.filter((item) => item !== id);
    (evidence as EvidenceWithBookmark).bookmarked = false;
  }
  saveBookmarks();
  if (state.currentPage === "evidence") renderEvidenceList();
}
export function applyStoredBookmarkFlags() {
  state.allEvidence.forEach((item) => {
    (item as EvidenceWithBookmark).bookmarked =
      state.bookmarks.indexOf(item.id) !== -1;
  });
}
export function sortEvidence() {
  const sort = control("sortEvidence").value,
    compare =
      sort === "title-asc"
        ? (a: Evidence, b: Evidence) => a.title.localeCompare(b.title)
        : sort === "title-desc"
          ? (a: Evidence, b: Evidence) => b.title.localeCompare(a.title)
          : sort === "date-asc"
            ? (a: Evidence, b: Evidence) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            : (a: Evidence, b: Evidence) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime();
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
    control(id).value = "";
  });
  renderEvidenceList();
}
export async function handleSearchInput() {
  const requestId = ++state.latestSearchRequestId;
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (requestId === state.latestSearchRequestId) renderEvidenceList();
}

export function openEvidenceDetail(id: string): void {
  const ev = findEvidenceById(id);
  if (!ev) return;
  state.selectedEvidence = ev;
  const section = element<HTMLElement>("evidenceDetailSection");
  section.classList.remove("hidden");
  renderEvidenceDetail(ev);
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}
export function closeEvidenceDetail() {
  const section = element<HTMLElement>("evidenceDetailSection");
  section.classList.add("hidden");
  section.innerHTML = "";
  state.selectedEvidence = null;
}
function option(current: string, value: string, label: string) {
  return `<option value="${value}"${(current || "").toLowerCase() === value ? " selected" : ""}>${label}</option>`;
}
function renderEvidenceDetail(ev: Evidence) {
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
  element<HTMLElement>("evidenceDetailSection").innerHTML =
    `<div class="evidence-detail-header"><div><h2>${ev.title}</h2><div class="evidence-meta">${ev.id} &middot; ${ev.type} &middot; ${formatDate(ev.timestamp)}</div></div><button type="button" class="btn btn-secondary btn-small" data-close-detail>Close</button></div>${ev.tags.indexOf("critical") !== -1 ? '<div class="warning-banner">This item is tagged as critical evidence.</div>' : ""}<div class="detail-field"><strong>Summary</strong>${ev.summary}</div><div class="evidence-detail-content">${ev.content}</div><div class="detail-field"><strong>Related people</strong>${people}</div><div class="detail-field"><strong>Related locations</strong>${locations}</div><div class="detail-field"><strong>Tags</strong>${ev.tags.map((tag) => `<span class="tag-chip">${tag}</span>`).join("")}</div><div class="detail-field"><strong>Review status</strong><select id="detailStatusSelect">${option(ev.status, "unreviewed", "Unreviewed")}${option(ev.status, "reviewed", "Reviewed")}${option(ev.status, "flagged", "Flagged")}</select></div><div class="detail-field"><strong>Relevance</strong><select id="detailRelevanceSelect">${option(ev.relevance, "unknown", "Unknown")}${option(ev.relevance, "relevant", "Relevant")}${option(ev.relevance, "irrelevant", "Irrelevant")}</select></div><div class="detail-field"><strong>Investigator note</strong><textarea id="evidenceNoteInput" class="note-textarea" rows="3" data-evidence-id="${ev.id}" placeholder="Add a private note about this evidence...">${note}</textarea><button type="button" class="btn btn-primary btn-small" style="margin-top:6px;" data-save-note>Save note</button></div><div class="detail-field"><strong>Note preview</strong><div id="notePreview">${note}</div></div>`;
  element<HTMLSelectElement>("detailStatusSelect").addEventListener(
    "change",
    (e: Event) => {
      if (!(e.currentTarget instanceof HTMLSelectElement)) return;
      ev.status = e.currentTarget.value;
      renderEvidenceDetail(ev);
      if (state.viewRendered.evidence) renderEvidenceList();
    },
  );
  element<HTMLSelectElement>("detailRelevanceSelect").addEventListener(
    "change",
    (e: Event) => {
      if (!(e.currentTarget instanceof HTMLSelectElement)) return;
      ev.relevance = e.currentTarget.value;
      renderEvidenceDetail(ev);
      if (state.viewRendered.evidence) renderEvidenceList();
    },
  );
}
export function handleDetailClick(event: MouseEvent) {
  const target = eventElement(event);
  if (!target) return;
  if (target.closest("[data-close-detail]")) closeEvidenceDetail();
  if (target.closest("[data-save-note]")) {
    const input = element<HTMLTextAreaElement>("evidenceNoteInput");
    const evidenceId = input.dataset.evidenceId;
    if (!evidenceId) return;
    saveNote(evidenceId, input.value);
    element<HTMLElement>("notePreview").innerHTML = input.value;
  }
}

export function switchPeopleTab(tab: string): void {
  state.currentPeopleTab = tab;
  const people = document.getElementById("peoplePanel"),
    locations = document.getElementById("locationsPanel"),
    peopleButton = document.getElementById("tabPeopleBtn"),
    locationsButton = document.getElementById("tabLocationsBtn");
  if (!people || !locations || !peopleButton || !locationsButton) return;
  people.classList.toggle("hidden", tab !== "people");
  locations.classList.toggle("hidden", tab === "people");
  peopleButton.classList.toggle("active", tab === "people");
  locationsButton.classList.toggle("active", tab !== "people");
}
export function renderPeople() {
  const container = document.getElementById("peoplePanel");
  if (!container) return;
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
  const container = document.getElementById("locationsPanel");
  if (!container) return;
  container.innerHTML = state.allLocations
    .map(
      (loc) =>
        `<div class="location-card"><h3>${loc.id} &mdash; ${loc.name}</h3><p>${loc.description}</p><p><strong>Contains:</strong></p><ul>${loc.contains.map((item) => `<li>${item}</li>`).join("")}</ul></div>`,
    )
    .join("");
}
export function handlePeopleClick(event: MouseEvent) {
  const target = eventElement(event);
  if (!target) return;
  const button = target.closest("[data-person-id]");
  if (!button) return;
  const personId = button.getAttribute("data-person-id");
  if (!personId) return;
  control("filterPerson").value = personId;
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
  const value = (id: string) => control(id).value,
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
        (order === "desc" ? -1 : 1) *
        (new Date(a.time).getTime() - new Date(b.time).getTime()),
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
export function handleTimelineClick(event: MouseEvent) {
  const target = eventElement(event);
  if (!target) return;
  const button = target.closest("[data-evidence-id]");
  const id = button?.getAttribute("data-evidence-id");
  if (id) openEvidenceModal(id);
}
function openEvidenceModal(id: string): void {
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
export function handleModalClick(event: MouseEvent) {
  const target = eventElement(event);
  if (!target) return;
  const modal = document.getElementById("quickViewModal");
  if (!modal) return;
  if (
    target.classList.contains("modal-close-btn") ||
    target.classList.contains("modal-backdrop")
  )
    modal.innerHTML = "";
  const open = target.closest("[data-open-full]");
  if (open) {
    const id = open.getAttribute("data-open-full");
    if (!id) return;
    modal.innerHTML = "";
    navigate("evidence");
    setTimeout(() => openEvidenceDetail(id), 0);
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
    items = state.allEvidence.filter((item) =>
      state.bookmarks.includes(item.id),
    );
  if (!container) return;
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
      .map((item, index) => ({
        item,
        index,
        text: state.notesStore[item.id] ?? "",
      }))
      .filter((item) => item.text.length > 0);
  if (!container) return;
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
  if (
    !(suspect instanceof HTMLSelectElement) ||
    !(evidence instanceof HTMLSelectElement)
  )
    return;
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
function selectedOptions(select: HTMLSelectElement): string[] {
  return [...select.options]
    .filter((option) => option.selected)
    .map((option) => option.value);
}
export function saveHypothesis() {
  const draft = {
    suspectId: control("hypSuspect").value,
    nature: control("hypNature").value,
    evidenceIds: selectedOptions(element<HTMLSelectElement>("hypEvidence")),
    confidence: control("hypConfidence").value,
    explanation: control("hypExplanation").value,
    alternative: control("hypAlternative").value,
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
  if (!message) return;
  message.classList.remove("hidden");
  setTimeout(() => message.classList.add("hidden"), 2000);
}
function loadHypothesis() {
  const draft = loadHypothesisDraft();
  if (!draft) return;
  control("hypSuspect").value = draft.suspectId || "";
  control("hypNature").value = draft.nature || "";
  control("hypConfidence").value = draft.confidence || "50";
  const confidenceValue = document.getElementById("hypConfidenceValue");
  if (confidenceValue) confidenceValue.textContent = draft.confidence || "50";
  control("hypExplanation").value = draft.explanation || "";
  control("hypAlternative").value = draft.alternative || "";
  [...element<HTMLSelectElement>("hypEvidence").options].forEach((option) => {
    option.selected = (draft.evidenceIds || []).indexOf(option.value) !== -1;
  });
}
export function handleWorkspaceClick(event: MouseEvent) {
  const target = eventElement(event);
  if (!target) return;
  const button = target.closest("[data-open-workspace-evidence]");
  if (!button) return;
  const id = button.getAttribute("data-open-workspace-evidence");
  if (!id) return;
  navigate("evidence");
  setTimeout(() => openEvidenceDetail(id), 0);
}
