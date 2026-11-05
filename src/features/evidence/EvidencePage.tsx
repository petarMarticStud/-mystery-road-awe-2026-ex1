import { useState } from "react";
import type { DashboardData } from "../../dashboardData";
import type { Evidence } from "../../../modules/domain";
import { loadNotes } from "./notes";

function EvidenceNote({ evidence }: { evidence: Evidence }) {
  const [notes, setNotes] = useState(loadNotes);
  const [text, setText] = useState(() => notes[evidence.id] ?? "");
  const [message, setMessage] = useState("");

  function saveNote() {
    const nextNotes = { ...notes, [evidence.id]: text };
    try {
      localStorage.setItem("remotion_notes", JSON.stringify(nextNotes));
      setNotes(nextNotes);
      setMessage("Note saved.");
    } catch {
      setMessage("The note could not be saved.");
    }
  }

  return (
    <div className="detail-field">
      <label htmlFor="evidence-note">Investigator note</label>
      <textarea
        id="evidence-note"
        className="note-textarea"
        rows={3}
        value={text}
        onChange={(event) => {
          setText(event.currentTarget.value);
          setMessage("");
        }}
      />
      <button
        type="button"
        className="btn btn-primary btn-small"
        onClick={saveNote}
      >
        Save note
      </button>
      <p role="status">{message}</p>
      <strong>Saved note preview</strong>
      <p>{notes[evidence.id] || "No saved note yet."}</p>
    </div>
  );
}

export function EvidencePage({ data }: { data: DashboardData }) {
  const [search, setSearch] = useState("");
  // Demo 5 will move bookmark ownership to the common ancestor.
  const [bookmarks, setBookmarks] = useState<readonly string[]>(() => [
    ...data.bookmarks,
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = data.evidence.find((item) => item.id === selectedId);
  const term = search.trim().toLowerCase();
  const results = data.evidence.filter((item) =>
    [item.title, item.summary, ...item.tags].some((text) =>
      text.toLowerCase().includes(term),
    ),
  );

  function toggleBookmark(id: string) {
    setBookmarks((previous) => {
      if (previous.includes(id)) {
        // filter creates a new array; previous stays unchanged.
        return previous.filter((item) => item !== id);
      }

      // Do not use previous.push(id): state must keep its old snapshot.
      return [...previous, id];
    });
  }

  return (
    <section>
      <h2>Evidence Catalogue</h2>
      <div className="toolbar">
        <label htmlFor="evidence-search">Search evidence</label>
        <input
          id="evidence-search"
          type="search"
          placeholder="Search by title, summary, or tag"
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
        />
        <fieldset disabled>
          <legend>Filters and sorting (Demo 7)</legend>
          {[
            ["Type", [...new Set(data.evidence.map((item) => item.type))]],
            ["Person", data.people.map((person) => person.name)],
            ["Location", data.locations.map((location) => location.name)],
            ["Status", ["unreviewed", "reviewed", "flagged"]],
            ["Relevance", ["unknown", "relevant", "irrelevant"]],
            [
              "Sort",
              ["Original order", "Newest first", "Oldest first", "Title"],
            ],
          ].map(([label, options]) => (
            <label key={label as string}>
              {label}
              <select defaultValue="">
                <option value="">All / default</option>
                {(options as string[]).map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          ))}
          <button type="button" className="btn btn-secondary">
            Clear filters
          </button>
        </fieldset>
      </div>
      <div className="evidence-grid">
        {results.map((item) => (
          <article key={item.id} className="evidence-card">
            <button
              type="button"
              className={`bookmark-btn${bookmarks.includes(item.id) ? " active" : ""}`}
              aria-label={`Toggle bookmark for ${item.title}`}
              aria-pressed={bookmarks.includes(item.id)}
              onClick={() => toggleBookmark(item.id)}
            >
              {bookmarks.includes(item.id) ? "★" : "☆"}
            </button>
            <h3>{item.title}</h3>
            <p className="evidence-meta">
              {item.id} · {item.type} · {item.timestamp}
            </p>
            <p>{item.summary}</p>
            <p>
              {item.status} · {item.relevance}
            </p>
            <div>
              {item.tags.map((tag) => (
                <span className="tag-chip" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={() => setSelectedId(item.id)}
            >
              Open details
            </button>
          </article>
        ))}
        {results.length === 0 && <p>No evidence matches your search.</p>}
      </div>
      {selected && (
        <section className="evidence-detail" aria-label="Evidence details">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setSelectedId(null)}
          >
            Close
          </button>
          <h3>{selected.title}</h3>
          <p>{selected.content}</p>
          <EvidenceNote key={selected.id} evidence={selected} />
        </section>
      )}
    </section>
  );
}
