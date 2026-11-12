import { useEffect, useState } from "react";
import type { Location } from "../../../modules/domain";
import { Panel } from "../../components/Panel";
import { LocationCard } from "./LocationCard";

// Exercise 6 – Demo 5, Task 1:
// Diese Ansicht laedt ihre Daten selbst vom Backend (GET /api/locations),
// statt sie als Prop aus App zu bekommen.
export function LocationsPage() {
  // null = noch keine Antwort da (laedt noch)
  const [locations, setLocations] = useState<Location[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLocations() {
      try {
        // "/api/..." wird vom Vite-Proxy an http://localhost:3001 weitergeleitet.
        const response = await fetch("/api/locations");

        // fetch wirft bei HTTP-Fehlern (z. B. 500) KEINEN Fehler -> selbst pruefen.
        if (!response.ok) {
          throw new Error(`locations: HTTP ${response.status}`);
        }

        const data = (await response.json()) as Location[];
        setLocations(data); // State-Aenderung -> React rendert erneut
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Could not load locations.",
        );
      }
    }

    loadLocations();
  }, []); // [] = einmal nach dem Einbinden laden

  if (error !== null) {
    return <p role="alert">Error: {error}</p>;
  }

  if (locations === null) {
    return <p>Loading locations…</p>;
  }

  return (
    <Panel title="Locations">
      {locations.map((location) => (
        <LocationCard
          key={location.id}
          name={location.name}
          description={location.description}
        />
      ))}
    </Panel>
  );
}
