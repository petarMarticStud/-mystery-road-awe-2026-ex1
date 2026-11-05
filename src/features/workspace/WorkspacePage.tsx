import { useState } from "react";
import type { DashboardData } from "../../dashboardData";
import { loadNotes } from "../evidence/notes";
import { loadHypothesis } from "./hypothesis";
import type { Hypothesis } from "./hypothesis";
import { useBookmarks } from "../evidence/BookmarksContext";

export function WorkspacePage({
  data,
}: {
  data: Omit<DashboardData, "bookmarks">;
}) {
  const { bookmarks } = useBookmarks();
  const [notes] = useState(loadNotes);
  const [hypothesis, setHypothesis] = useState(loadHypothesis);
  const [saveMessage, setSaveMessage] = useState("");

  function updateField<K extends keyof Hypothesis>(
    field: K,
    value: Hypothesis[K],
  ) {
    setHypothesis((previous) => ({ ...previous, [field]: value }));
    setSaveMessage("");
  }

  function saveHypothesis() {
    try {
      localStorage.setItem(
        "remotion_hypothesis",
        JSON.stringify({
          ...hypothesis,
          savedAt: new Date().toISOString(),
        }),
      );
      setSaveMessage("Hypothesis draft saved.");
    } catch {
      setSaveMessage("The draft could not be saved. Please try again.");
    }
  }
  const bookmarked = data.evidence.filter((item) =>
    bookmarks.includes(item.id),
  );
  const noted = data.evidence.filter((item) => notes[item.id]);

  return (
    <section>
      <h2>Workspace</h2>
      <div className="workspace-columns">
        <div className="workspace-card">
          <h3>Bookmarked evidence</h3>
          {bookmarked.length === 0 && <p>No bookmarked evidence yet.</p>}
          {bookmarked.map((item) => (
            <p key={item.id}>
              <strong>{item.id}</strong> — {item.title}
            </p>
          ))}
        </div>
        <div className="workspace-card">
          <h3>Investigator notes</h3>
          {noted.length === 0 && (
            <p>No notes yet. Save a note in an evidence detail view.</p>
          )}
          {noted.map((item) => (
            <div className="mini-list-item" key={item.id}>
              <strong>
                {item.id} — {item.title}
              </strong>
              <p>{notes[item.id]}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="hypothesis-card">
        <h3>Hypothesis Draft</h3>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            saveHypothesis();
          }}
        >
          <fieldset>
            <legend>Your hypothesis</legend>
            <div className="form-row">
              <label htmlFor="hyp-suspect">Suspected responsible person</label>
              <select
                id="hyp-suspect"
                value={hypothesis.suspectId}
                onChange={(event) =>
                  updateField("suspectId", event.currentTarget.value)
                }
              >
                <option value="">Select a person…</option>
                {data.people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label htmlFor="hyp-nature">
                Accidental or deliberate incident
              </label>
              <select
                id="hyp-nature"
                value={hypothesis.nature}
                onChange={(event) =>
                  updateField("nature", event.currentTarget.value)
                }
              >
                <option value="">Select…</option>
                <option value="accidental">Accidental</option>
                <option value="deliberate">Deliberate</option>
                <option value="unclear">Unclear</option>
              </select>
            </div>
            <div className="form-row">
              <label htmlFor="hyp-evidence">Selected supporting evidence</label>
              <select
                id="hyp-evidence"
                multiple
                size={6}
                value={hypothesis.evidenceIds}
                onChange={(event) =>
                  updateField(
                    "evidenceIds",
                    Array.from(
                      event.currentTarget.selectedOptions,
                      (option) => option.value,
                    ),
                  )
                }
              >
                {data.evidence.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.id} — {item.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label htmlFor="hyp-confidence">Confidence (0–100)</label>
              <input
                id="hyp-confidence"
                type="range"
                min={0}
                max={100}
                value={hypothesis.confidence}
                onChange={(event) =>
                  updateField("confidence", event.currentTarget.valueAsNumber)
                }
              />
              <output htmlFor="hyp-confidence">{hypothesis.confidence}</output>
            </div>
            <div className="form-row">
              <label htmlFor="hyp-explanation">Written explanation</label>
              <textarea
                id="hyp-explanation"
                rows={4}
                value={hypothesis.explanation}
                onChange={(event) =>
                  updateField("explanation", event.currentTarget.value)
                }
              />
            </div>
            <div className="form-row">
              <label htmlFor="hyp-alternative">Alternative explanation</label>
              <textarea
                id="hyp-alternative"
                rows={3}
                value={hypothesis.alternative}
                onChange={(event) =>
                  updateField("alternative", event.currentTarget.value)
                }
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Save hypothesis draft
            </button>
            <p role="status">{saveMessage}</p>
          </fieldset>
        </form>
      </div>
    </section>
  );
}
