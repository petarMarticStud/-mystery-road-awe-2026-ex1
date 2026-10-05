import { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import { loadDashboardData } from "./dashboardData";
import type { DashboardData } from "./dashboardData";

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
    if (currentPage !== "dashboard") {
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
      return <p role="status">Dashboard wird geladen …</p>;
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
