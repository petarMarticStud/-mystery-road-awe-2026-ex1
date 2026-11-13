import { useEffect, useState } from "react";
import Dashboard from "../features/dashboard/Dashboard";
import { loadDashboardData } from "../dashboardData";
import type { DashboardData } from "../dashboardData";
import { Panel } from "../components/Panel";
import { PeoplePage } from "../features/people-locations/PeoplePage";
import { LocationsPage } from "../features/people-locations/LocationsPage";
import { NavLink, Navigate, Route, Routes, useLocation } from "react-router";
import { EffectDemo } from "../components/EffectDemo";
import { PersonDetailPage } from "../features/people-locations/PersonDetailPage";
import { TimelinePage } from "../features/timeline/TimelinePage";
import { EvidencePage } from "../features/evidence/EvidencePage";
import { WorkspacePage } from "../features/workspace/WorkspacePage";
import { BookmarksContext } from "../features/evidence/BookmarksContext";
import { loadNotes } from "../features/evidence/notes";
import { loadHypothesis } from "../features/workspace/hypothesis";

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = `Project ReMotion – ${pathname}`;
  }, [pathname]);

  // App bleibt beim Navigieren bestehen und behaelt deshalb die Daten.
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState(loadNotes);
  const [hypothesis, setHypothesis] = useState(loadHypothesis);

  function saveNote(id: string, text: string) {
    const nextNotes = { ...notes, [id]: text };
    localStorage.setItem("remotion_notes", JSON.stringify(nextNotes));
    setNotes(nextNotes);
  }

  function toggleBookmark(id: string) {
    setData((previous) => {
      if (previous === null) return previous;
      const bookmarks = previous.bookmarks.includes(id)
        ? previous.bookmarks.filter((item) => item !== id)
        : [...previous.bookmarks, id];
      return { ...previous, bookmarks };
    });
  }

  function changeEvidenceStatus(id: string, status: string) {
    setData((previous) => {
      if (previous === null) return previous;
      return {
        ...previous,
        evidence: previous.evidence.map((item) =>
          item.id === id ? { ...item, status } : item,
        ),
      };
    });
  }

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const loadedData = await loadDashboardData();
        if (!cancelled) {
          setData(loadedData);
        }
      } catch (error) {
        if (!cancelled) {
          let message = "Could not load data.";
          if (error instanceof Error) {
            message = error.message;
          }
          setError(message);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <BookmarksContext.Provider
      value={{
        bookmarks: data?.bookmarks ?? [],
        onToggleBookmark: toggleBookmark,
      }}
    >
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <div>
              <h1>Project ReMotion</h1>
              <p className="subtitle">Investigation Portal</p>
            </div>
          </div>

          <nav className="main-nav" aria-label="Main navigation">
            <NavLink to="/dashboard" className="nav-btn">
              Dashboard
            </NavLink>

            <NavLink to="/team" className="nav-btn">
              People & Locations
            </NavLink>

            <NavLink to="/timeline" className="nav-btn">
              Timeline
            </NavLink>

            <NavLink to="/evidence" className="nav-btn">
              Evidence
            </NavLink>

            <NavLink to="/workspace" className="nav-btn">
              Workspace
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="app-main react-main">
        {import.meta.env.DEV && <EffectDemo />}
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/dashboard"
            element={
              error !== null ? (
                <p role="alert">Error: {error}</p>
              ) : data === null ? (
                <p>Loading data…</p>
              ) : (
                <Dashboard data={data} />
              )
            }
          />

          <Route
            path="/team"
            element={<Navigate to="/team/people" replace />}
          />

          <Route
            path="/team/people"
            element={
              <>
                <nav className="team-tabs" aria-label="People and locations">
                  <NavLink to="/team/people" className="nav-btn">
                    People
                  </NavLink>

                  <NavLink to="/team/locations" className="nav-btn">
                    Locations
                  </NavLink>
                </nav>

                {/* Demo 8: laedt seine Daten selbst ueber den Hook useFetch */}
                <PeoplePage />
              </>
            }
          />

          <Route
            path="/team/people/:personId"
            element={
              error !== null ? (
                <p role="alert">Error: {error}</p>
              ) : data === null ? (
                <p>Loading data…</p>
              ) : (
                <PersonDetailPage people={data.people} />
              )
            }
          />

          <Route
            path="/team/locations"
            element={
              <>
                <nav className="team-tabs" aria-label="People and locations">
                  <NavLink to="/team/people" className="nav-btn">
                    People
                  </NavLink>

                  <NavLink to="/team/locations" className="nav-btn">
                    Locations
                  </NavLink>
                </nav>

                {/* Demo 8: laedt seine Daten selbst ueber den Hook useFetch */}
                <LocationsPage />
              </>
            }
          />

          <Route
            path="/timeline"
            element={
              error !== null ? (
                <p role="alert">Error: {error}</p>
              ) : data === null ? (
                <p>Loading data…</p>
              ) : (
                <Panel title="Timeline">
                  {data.timeline.length === 0 ? (
                    <p>No events available.</p>
                  ) : (
                    <TimelinePage events={data.timeline} people={data.people} />
                  )}
                </Panel>
              )
            }
          />

          <Route
            path="/evidence"
            element={
              error !== null ? (
                <p role="alert">Error: {error}</p>
              ) : data === null ? (
                <p>Loading data…</p>
              ) : (
                <EvidencePage
                  data={data}
                  onChangeStatus={changeEvidenceStatus}
                  notes={notes}
                  onSaveNote={saveNote}
                />
              )
            }
          />

          <Route
            path="/workspace"
            element={
              error !== null ? (
                <p role="alert">Error: {error}</p>
              ) : data === null ? (
                <p>Loading data…</p>
              ) : (
                <WorkspacePage
                  data={data}
                  notes={notes}
                  hypothesis={hypothesis}
                  onChangeHypothesis={setHypothesis}
                />
              )
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </BookmarksContext.Provider>
  );
}
