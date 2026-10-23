import { useEffect, useState } from "react";
import Dashboard from "../features/dashboard/Dashboard";
import { loadDashboardData } from "../dashboardData";
import type { DashboardData } from "../dashboardData";
import { Panel } from "../components/Panel";
import { PersonCard } from "../features/people-locations/PersonCard";
import { LocationCard } from "../features/people-locations/LocationCard";
import { Link, NavLink, Navigate, Route, Routes } from "react-router";
import { PersonDetailPage } from "../features/people-locations/PersonDetailPage";
import {TimelinePage} from "../features/timeline/TimelinePage";

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
    <>
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

                {error !== null ? (
                  <p role="alert">Error: {error}</p>
                ) : data === null ? (
                  <p>Loading data…</p>
                ) : (
                  <Panel title="People">
                    {data.people.map((person) => (
                      <PersonCard
                        key={person.id}
                        name={person.name}
                        role={person.role}
                      >
                        <Link
                          to={`/team/people/${person.id}`}
                          className="detail-button"
                        >
                          View profile <span aria-hidden="true">→</span>
                        </Link>
                      </PersonCard>
                    ))}
                  </Panel>
                )}
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

                {error !== null ? (
                  <p role="alert">Error: {error}</p>
                ) : data === null ? (
                  <p>Loading data…</p>
                ) : (
                  <Panel title="Locations">
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
                <p role="alert">Error: {error}</p>
              ) : data === null ? (
                <p>Loading data…</p>
              ) : (
                <Panel title="Timeline">
                  {data.timeline.length === 0 ? (
                    <p>No events available.</p>
                  ) : (
                      <TimelinePage
                        events={data.timeline}
                        people={data.people}
                      />
                  )}
                </Panel>
              )
            }
          />

          <Route
            path="/evidence"
            element={<p>This view will be migrated to React later.</p>}
          />

          <Route
            path="/workspace"
            element={<p>This view will be migrated to React later.</p>}
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </>
  );
}
