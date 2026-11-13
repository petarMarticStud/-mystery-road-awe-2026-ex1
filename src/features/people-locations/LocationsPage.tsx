import { useState } from "react";
import type { Location } from "../../../modules/domain";
import { Panel } from "../../components/Panel";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/LoadStates";
import { useFetch } from "../../hooks/useFetch";
import { LocationCard } from "./LocationCard";

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
  const [simulation, setSimulation] = useState<Simulation>("normal");
  // Exercise 6 – Demo 7: nur fuer die Vorfuehrung. Ausgeschaltet zeigt es die Race Condition.
  const [cancelStale, setCancelStale] = useState(true);

  // Exercise 6 – Demo 8: Laden, Lade-/Fehler-/Leer-State und Abbrechen kommen aus dem Hook.
  // Aendert sich die Simulation, aendert sich die URL -> der Hook laedt neu.
  const { state, reload } = useFetch<Location[]>(
    `/api/locations${SIMULATIONS[simulation].query}`,
    { cancelStale },
  );

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

      {import.meta.env.DEV && (
        <label className="simulation-control">
          <input
            type="checkbox"
            checked={cancelStale}
            onChange={(event) => setCancelStale(event.target.checked)}
          />{" "}
          Cancel stale requests (Demo 7 fix)
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
            onRetry={reload}
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
