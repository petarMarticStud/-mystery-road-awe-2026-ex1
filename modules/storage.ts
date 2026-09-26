import { state, STORAGE_KEYS } from "./state.js";


interface HypothesisDraft {
  suspectId: string;
  nature: string;
  evidenceIds: string[];
  confidence: string;
  explanation: string;
  alternative: string;
  savedAt: string;
}

export function saveBookmarks() {
  localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(state.bookmarks));
}
export function loadBookmarks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.bookmarks);
    const parsed = raw ? JSON.parse(raw) : [];
    state.bookmarks = Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Could not read stored bookmarks, starting empty", err);
    state.bookmarks = [];
  }
}
export function saveNote(evidenceId: string, text: string) {
  state.notesStore[evidenceId] = text;
  localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(state.notesStore));
}
export function getNote(evidenceId : string): string {
  return state.notesStore[evidenceId] || "";
}
export function loadNotes() {
  const raw = localStorage.getItem(STORAGE_KEYS.notes);
  state.notesStore = raw ? JSON.parse(raw) : {};
}
export function loadNoteAsync(evidenceId: string) : Promise<string> {
  return Promise.resolve(state.notesStore[evidenceId] || "");
}
export function saveHypothesisDraft(draft: HypothesisDraft) {
  localStorage.setItem(STORAGE_KEYS.hypothesis, JSON.stringify(draft));
}
export function loadHypothesisDraft(): HypothesisDraft | null {
  const raw = localStorage.getItem(STORAGE_KEYS.hypothesis);
  return raw ? JSON.parse(raw) as HypothesisDraft : null;
}
