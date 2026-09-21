import { state } from "./state.js";

export const findEvidenceById = id => state.allEvidence.find(item => item.id === id) || null;
export const findPersonById = id => state.allPeople.find(item => item.id === id) || null;
export const findLocationById = id => state.allLocations.find(item => item.id === id) || null;
export function evidenceMentionsPerson(ev, person) { return !!ev.personIds && (ev.personIds.indexOf(person.id) !== -1 || ev.personIds.indexOf(person.name) !== -1); }
export function formatDate(ts) { if (!ts) return "Unknown date"; const d = new Date(ts); return isNaN(d.getTime()) ? ts : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) + " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }); }
export const statusBadgeClass = status => {
  const value = (status || "").toLowerCase();

  return value === "reviewed"
    ? "badge-reviewed"
    : value === "flagged"
      ? "badge-flagged"
      : "badge-unreviewed";
};

export const relevanceBadgeClass = relevance =>
  (relevance || "").toLowerCase() === "relevant"
    ? "badge-relevant"
    : "badge-unreviewed";