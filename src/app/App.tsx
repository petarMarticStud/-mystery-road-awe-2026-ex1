import { useEffect, useState } from "react";
import Dashboard from "../features/dashboard/Dashboard";
import { loadDashboardData } from "../dashboardData";
import type { DashboardData } from "../dashboardData";
import { Panel } from "../components/Panel";
import { PersonCard } from "../features/people-locations/PersonCard";
import { LocationCard } from "../features/people-locations/LocationCard";
import { TimelineEventCard } from "../features/timeline/TimelineEventCard";
import { NavLink, Navigate, Route, Routes } from "react-router";

export default function App() {
  // App bleibt beim Navigieren bestehen und behaelt deshalb die Daten.
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          let message = "Daten konnten nicht geladen werden.";
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
    <>
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <div>
              <h1>Project ReMotion</h1>
              <p className="subtitle">Investigation Portal</p>
            </div>
          </div>

          <nav className="main-nav" aria-label="Hauptnavigation">
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
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/dashboard"
            element={
              error !== null ? (
                <p role="alert">Fehler: {error}</p>
              ) : data === null ? (
                <p>Daten werden geladen …</p>
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
                <nav className="team-tabs" aria-label="Personen und Orte">
                  <NavLink to="/team/people" className="nav-btn">
                    Personen
                  </NavLink>

                  <NavLink to="/team/locations" className="nav-btn">
                    Orte
                  </NavLink>
                </nav>

                {error !== null ? (
                  <p role="alert">Fehler: {error}</p>
                ) : data === null ? (
                  <p>Daten werden geladen …</p>
                ) : (
                  <Panel title="Personen">
                    {data.people.map((person) => (
                      <PersonCard
                        key={person.id}
                        name={person.name}
                        role={person.role}
                      />
                    ))}
                  </Panel>
                )}
              </>
            }
          />

          <Route
            path="/team/locations"
            element={
              <>
                <nav className="team-tabs" aria-label="Personen und Orte">
                  <NavLink to="/team/people" className="nav-btn">
                    Personen
                  </NavLink>

                  <NavLink to="/team/locations" className="nav-btn">
                    Orte
                  </NavLink>
                </nav>

                {error !== null ? (
                  <p role="alert">Fehler: {error}</p>
                ) : data === null ? (
                  <p>Daten werden geladen …</p>
                ) : (
                  <Panel title="Orte">
                    {data.locations.map((location) => (
                      <LocationCard
                        key={location.id}
                        name={location.name}
                        description={location.description}
                      />
                    ))}
                  </Panel>
                )}
              </>
            }
          />

          <Route
            path="/timeline"
            element={
              error !== null ? (
                <p role="alert">Fehler: {error}</p>
              ) : data === null ? (
                <p>Daten werden geladen …</p>
              ) : (
                <Panel title="Timeline">
                  {data.timeline.length === 0 ? (
                    <p>Keine Ereignisse vorhanden.</p>
                  ) : (
                    data.timeline.map((event) => (
                      <TimelineEventCard
                        key={event.id}
                        time={event.time}
                        title={event.title}
                        description={event.description}
                        certainty={event.certainty}
                      />
                    ))
                  )}
                </Panel>
              )
            }
          />

          <Route
            path="/evidence"
            element={<p>Diese Ansicht wird später nach React migriert.</p>}
          />

          <Route
            path="/workspace"
            element={<p>Diese Ansicht wird später nach React migriert.</p>}
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </>
  );
}
