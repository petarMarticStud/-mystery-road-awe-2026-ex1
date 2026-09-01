import { state, STORAGE_KEYS } from "./state.js";

export function saveBookmarks() { localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(state.bookmarks)); }
export function loadBookmarks() {
  try { const raw = localStorage.getItem(STORAGE_KEYS.bookmarks); const parsed = raw ? JSON.parse(raw) : []; state.bookmarks = Array.isArray(parsed) ? parsed : []; }
  catch (err) { console.warn("Could not read stored bookmarks, starting empty", err); state.bookmarks = []; }
}
export function saveNote(evidenceId, text) { state.notesStore[evidenceId] = text; localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(state.notesStore)); }
export function getNote(evidenceId) { return state.notesStore[evidenceId] || ""; }
export function loadNotes() { const raw = localStorage.getItem(STORAGE_KEYS.notes); state.notesStore = raw ? JSON.parse(raw) : {}; }
export function loadNoteAsync(evidenceId) { return Promise.resolve(state.notesStore[evidenceId] || ""); }
export function saveHypothesisDraft(draft) { localStorage.setItem(STORAGE_KEYS.hypothesis, JSON.stringify(draft)); }
export function loadHypothesisDraft() { const raw = localStorage.getItem(STORAGE_KEYS.hypothesis); return raw ? JSON.parse(raw) : null; }
