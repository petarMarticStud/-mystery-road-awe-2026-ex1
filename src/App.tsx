import { useEffect, useState } from "react";
import Dashboard from "./features/dashboard/Dashboard";
import { loadDashboardData } from "./dashboardData";
import type { DashboardData } from "./dashboardData";
import { Panel } from "./components/Panel";
import { PersonCard } from "./features/people-locations/PersonCard";
import { LocationCard } from "./features/people-locations/LocationCard";
import { TimelineEventCard } from "./features/timeline/TimelineEventCard";

const pages = [
  { id: "dashboard", label: "Dashboard" },
  { id: "evidence", label: "Evidence" },
  { id: "people", label: "People & Locations" },
  { id: "timeline", label: "Timeline" },
  { id: "workspace", label: "Workspace" },
] as const;

type Page = (typeof pages)[number]["id"];

function readPageFromHash(): Page {
  const hash = window.location.hash.slice(1);
  const page = pages.find((page) => page.id === hash);

  return page ? page.id : "dashboard";
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(readPageFromHash);
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

  useEffect(() => {
    function handleHashChange() {
      setCurrentPage(readPageFromHash());
    }

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const activePage = pages.find((page) => page.id === currentPage)!;

  function renderCurrentPage() {
    if (currentPage === "evidence" || currentPage === "workspace") {
      return (
        <section key={currentPage}>
          <h2>{activePage.label}</h2>
          <p>Diese Ansicht wird später nach React migriert.</p>
        </section>
      );
    }

    if (error !== null) {
      return <p role="alert">Fehler: {error}</p>;
    }

    if (data === null) {
      return <p role="status">Daten werden geladen …</p>;
    }

    if (currentPage === "people") {
      return (
        <>
          <Panel title="Personen">
            {data.people.map((person) => (
              <PersonCard
                key={person.id}
                name={person.name}
                role={person.role}
              />
            ))}
          </Panel>
          <Panel title="Orte">
            {data.locations.map((location) => (
              <LocationCard
                key={location.id}
                name={location.name}
                description={location.description}
              />
            ))}
          </Panel>
        </>
      );
    }
    if (currentPage === "timeline") {
      if (data.timeline.length === 0) {
        return (
          <Panel title="Timeline">
            <p>Keine Ereignisse vorhanden.</p>
          </Panel>
        );
      }

      return (
        <Panel title="Timeline">
          {data.timeline.map((event) => (
            <TimelineEventCard
              key={event.id}
              time={event.time}
              title={event.title}
              description={event.description}
              certainty={event.certainty}
            />
          ))}
        </Panel>
      );
    }

    return <Dashboard data={data} />;
  }

  return (
    <>
      <header className="app-header">
        <h1>Project ReMotion</h1>
        <p>Investigation Portal</p>
      </header>

      <nav aria-label="Hauptnavigation">
        {pages.map((page) => (
          <a
            key={page.id}
            href={`#${page.id}`}
            className={currentPage === page.id ? "nav-btn active" : "nav-btn"}
            aria-current={currentPage === page.id ? "page" : undefined}
          >
            {page.label}
          </a>
        ))}
      </nav>

      <main>{renderCurrentPage()}</main>
    </>
  );
}
