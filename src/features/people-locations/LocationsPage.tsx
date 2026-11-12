import { useEffect, useState } from "react";
import type { Location } from "../../../modules/domain";
import { Panel } from "../../components/Panel";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/LoadStates";
import { LocationCard } from "./LocationCard";

// Exercise 6 – Demo 6: EIN State-Objekt beschreibt den Ladezustand.
// Es kann immer nur genau einer der drei Faelle gelten.
type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: Location[] };

// Nur fuer die Entwicklung: steuert die Simulation im Backend (siehe Demo 4).
const SIMULATIONS = {
  normal: { label: "Normal", query: "" },
  slow: { label: "Slow (3 s)", query: "?delay=3000" },
  error: { label: "Server error (500)", query: "?fail=1" },
  slowError: { label: "Slow error (2 s, then 500)", query: "?delay=2000&fail=1" },
  empty: { label: "Empty response", query: "?empty=1" },
};
type Simulation = keyof typeof SIMULATIONS;

export function LocationsPage() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [simulation, setSimulation] = useState<Simulation>("normal");
  // Wird bei "Try again" erhoeht und startet dadurch den Effect neu.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Jeder neue Ladevorgang beginnt wieder im Ladezustand.
    setState({ status: "loading" });

    async function loadLocations() {
      try {
        const response = await fetch(
          `/api/locations${SIMULATIONS[simulation].query}`,
        );

        if (!response.ok) {
          throw new Error(`The server answered with HTTP ${response.status}.`);
        }

        const data = (await response.json()) as Location[];
        setState({ status: "success", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Unknown network error.",
        });
      }
    }

    loadLocations();
    // Hinweis: Wechselt man die Simulation, bevor die alte Antwort da ist,
    // kann eine veraltete Antwort gewinnen -> wird in Demo 7 behoben.
  }, [simulation, attempt]);

  return (
    <>
      {import.meta.env.DEV && (
        <label className="simulation-control">
          Backend simulation (dev only):{" "}
          <select
            value={simulation}
            onChange={(event) =>
              setSimulation(event.target.value as Simulation)
            }
          >
            {Object.entries(SIMULATIONS).map(([key, option]) => (
              <option key={key} value={key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      )}

      <Panel title="Locations">
        {state.status === "loading" && (
          <LoadingState text="Loading locations…" />
        )}

        {state.status === "error" && (
          <ErrorState
            title="Locations could not be loaded."
            message={state.message}
            onRetry={() => setAttempt((previous) => previous + 1)}
          />
        )}

        {/* "Leer" ist kein eigener State, sondern: erfolgreich UND 0 Eintraege. */}
        {state.status === "success" && state.data.length === 0 && (
          <EmptyState
            title="No locations recorded for this case."
            hint="The server responded successfully, but returned no locations."
          />
        )}

        {state.status === "success" &&
          state.data.map((location) => (
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
