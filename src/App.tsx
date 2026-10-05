import { useEffect, useState } from "react";

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
            className={
              currentPage === page.id ? "nav-btn active" : "nav-btn"
            }
            aria-current={currentPage === page.id ? "page" : undefined}
          >
            {page.label}
          </a>
        ))}
      </nav>

      <main>
        <section key={currentPage}>
          <h2>{activePage.label}</h2>
          <p>Diese Ansicht wird später nach React migriert.</p>
        </section>
      </main>
    </>
  );
}