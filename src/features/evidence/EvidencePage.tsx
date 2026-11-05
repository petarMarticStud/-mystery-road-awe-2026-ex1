import { useReducer, useState } from "react";
import type { DashboardData } from "../../dashboardData";
import type { Evidence } from "../../../modules/domain";
import { loadNotes } from "./notes";
import { filterReducer, initialFilters } from "./filterReducer";
import { useBookmarks } from "./BookmarksContext";

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

interface EvidencePageProps {
  data: Omit<DashboardData, "bookmarks">;
  onChangeStatus: (id: string, status: string) => void;
}

export function EvidencePage({ data, onChangeStatus }: EvidencePageProps) {
  const [filters, dispatch] = useReducer(filterReducer, initialFilters);
  const { bookmarks, onToggleBookmark } = useBookmarks();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = data.evidence.find((item) => item.id === selectedId);
  const term = filters.search.trim().toLowerCase();
  const results = data.evidence.filter(
    (item) =>
      [item.title, item.summary, ...item.tags].some((text) =>
        text.toLowerCase().includes(term),
      ) &&
      (!filters.type || item.type.toLowerCase() === filters.type) &&
      (!filters.person || item.personIds.includes(filters.person)) &&
      (!filters.location || item.locationIds.includes(filters.location)) &&
      (!filters.status || item.status.toLowerCase() === filters.status) &&
      (!filters.relevance ||
        item.relevance.toLowerCase() === filters.relevance),
  );
  // filter always creates a new array, including when all filters are empty.
  // Sorting this result cannot change the master evidence array.
  if (filters.sort === "title") {
    results.sort((a, b) => a.title.localeCompare(b.title));
  } else if (filters.sort === "newest") {
    results.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  } else if (filters.sort === "oldest") {
    results.sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
  }

  const filterFields: {
    key: Exclude<keyof typeof initialFilters, "search">;
    label: string;
    options: { value: string; label: string }[];
  }[] = [
    {
      key: "type",
      label: "Type",
      options: [
        ...new Set(data.evidence.map((item) => item.type.toLowerCase())),
      ].map((type) => ({ value: type, label: type })),
    },
    {
      key: "person",
      label: "Person",
      options: data.people.map((person) => ({
        value: person.id,
        label: person.name,
      })),
    },
    {
      key: "location",
      label: "Location",
      options: data.locations.map((location) => ({
        value: location.id,
        label: location.name,
      })),
    },
    {
      key: "status",
      label: "Status",
      options: ["unreviewed", "reviewed", "flagged"].map((value) => ({
        value,
        label: value,
      })),
    },
    {
      key: "relevance",
      label: "Relevance",
      options: ["unknown", "relevant", "irrelevant"].map((value) => ({
        value,
        label: value,
      })),
    },
    {
      key: "sort",
      label: "Sort",
      options: [
        { value: "original", label: "Original order" },
        { value: "newest", label: "Newest first" },
        { value: "oldest", label: "Oldest first" },
        { value: "title", label: "Title" },
      ],
    },
  ];

  return (
    <section>
      <h2>Evidence Catalogue</h2>
      <div className="toolbar">
        <label htmlFor="evidence-search">Search evidence</label>
        <input
          id="evidence-search"
          type="search"
          placeholder="Search by title, summary, or tag"
          value={filters.search}
          onChange={(event) =>
            dispatch({
              type: "SET_FILTER",
              field: "search",
              value: event.currentTarget.value,
            })
          }
        />
        <fieldset>
          <legend>Filters and sorting</legend>
          {filterFields.map(({ key, label, options }) => (
            <label key={key}>
              {label}
              <select
                value={filters[key]}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  if (key === "sort") {
                    dispatch({ type: "SET_SORT", value });
                  } else {
                    dispatch({ type: "SET_FILTER", field: key, value });
                  }
                }}
              >
                {key !== "sort" && <option value="">All</option>}
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => dispatch({ type: "CLEAR_FILTERS" })}
          >
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
              onClick={() => onToggleBookmark(item.id)}
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
          <div className="detail-field">
            <label htmlFor="evidence-review-status">Review status</label>
            <select
              id="evidence-review-status"
              value={selected.status.toLowerCase()}
              onChange={(event) =>
                onChangeStatus(selected.id, event.currentTarget.value)
              }
            >
              <option value="unreviewed">Unreviewed</option>
              <option value="reviewed">Reviewed</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
          <EvidenceNote key={selected.id} evidence={selected} />
        </section>
      )}
    </section>
  );
}
