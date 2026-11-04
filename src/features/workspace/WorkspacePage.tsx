import { useState } from "react";
import type { DashboardData } from "../../dashboardData";
import { loadNotes } from "../evidence/notes";

export function WorkspacePage({ data }: { data: DashboardData }) {
  const [notes] = useState(loadNotes);
  const bookmarked = data.evidence.filter((item) =>
    data.bookmarks.includes(item.id),
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
        <form>
          <fieldset disabled>
            <legend>
              Hypothesis form (controlled fields and saving follow in Demo 2)
            </legend>
            <div className="form-row">
              <label htmlFor="hyp-suspect">Suspected responsible person</label>
              <select id="hyp-suspect" defaultValue="">
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
              <select id="hyp-nature" defaultValue="">
                <option value="">Select…</option>
                <option value="accidental">Accidental</option>
                <option value="deliberate">Deliberate</option>
                <option value="unclear">Unclear</option>
              </select>
            </div>
            <div className="form-row">
              <label htmlFor="hyp-evidence">Selected supporting evidence</label>
              <select id="hyp-evidence" multiple size={6} defaultValue={[]}>
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
                defaultValue={50}
              />
              <output>50</output>
            </div>
            <div className="form-row">
              <label htmlFor="hyp-explanation">Written explanation</label>
              <textarea id="hyp-explanation" rows={4} />
            </div>
            <div className="form-row">
              <label htmlFor="hyp-alternative">Alternative explanation</label>
              <textarea id="hyp-alternative" rows={3} />
            </div>
            <button type="button" className="btn btn-primary">
              Save hypothesis draft
            </button>
          </fieldset>
        </form>
      </div>
    </section>
  );
}
