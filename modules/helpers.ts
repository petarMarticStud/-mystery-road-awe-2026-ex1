import { state } from "./state.js";

export const findEvidenceById = (id: string) =>
  state.allEvidence.find((item) => item.id === id) || null;

export const findPersonById = (id: string) =>
  state.allPeople.find((item) => item.id === id) || null;

export const findLocationById = (id: string) =>
  state.allLocations.find((item) => item.id === id) || null;

export function evidenceMentionsPerson(
  ev: { personIds?: string[] },
  person: { id: string},
): boolean {
  return (
    !!ev.personIds &&
    (ev.personIds.indexOf(person.id) !== -1)
  );
}

export function formatDate(ts: string | null | undefined): string {
  if (!ts) return "Unknown date";
  const d = new Date(ts);
  return isNaN(d.getTime())
    ? ts
    : d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }) +
        " " +
        d.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        });
}

export const statusBadgeClass = (status: string): string => {
  const value = (status || "").toLowerCase();

  return value === "reviewed"
    ? "badge-reviewed"
    : value === "flagged"
      ? "badge-flagged"
      : "badge-unreviewed";
};

export const relevanceBadgeClass = (relevance: string): string =>
  (relevance || "").toLowerCase() === "relevant"
    ? "badge-relevant"
    : "badge-unreviewed";
