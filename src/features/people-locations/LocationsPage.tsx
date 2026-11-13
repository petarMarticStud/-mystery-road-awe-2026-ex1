import { useState } from "react";
import type { Location } from "../../../modules/domain";
import { Panel } from "../../components/Panel";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/LoadStates";
import { fetchLocations } from "../../api/mysteryApi";
import type { Simulate } from "../../api/mysteryApi";
import { useApi } from "../../hooks/useApi";
import { LocationCard } from "./LocationCard";

// Nur fuer die Entwicklung: steuert die Simulation im Backend (siehe Demo 4).
// Demo 9: Hier steht nur noch, WAS simuliert wird. Wie die Query-Parameter
// heissen (?delay=, ?fail=1, ...), weiss nur die API-Schicht.
const SIMULATIONS = {
  normal: { label: "Normal", simulate: {} },
  slow: { label: "Slow (3 s)", simulate: { delayMs: 3000 } },
  error: { label: "Server error (500)", simulate: { fail: true } },
  slowError: {
    label: "Slow error (2 s, then 500)",
    simulate: { delayMs: 2000, fail: true },
  },
  empty: { label: "Empty response", simulate: { empty: true } },
} satisfies Record<string, { label: string; simulate: Simulate }>;
type Simulation = keyof typeof SIMULATIONS;

export function LocationsPage() {
  const [simulation, setSimulation] = useState<Simulation>("normal");
  // Exercise 6 – Demo 7: nur fuer die Vorfuehrung. Ausgeschaltet zeigt es die Race Condition.
  const [cancelStale, setCancelStale] = useState(true);

  // Exercise 6 – Demo 8/9: WAS geladen wird kommt aus der API-Schicht (fetchLocations),
  // WIE (Ladezustand, Fehler, Abbrechen) aus dem Hook. Aendert sich simulation -> neu laden.
  const { state, reload } = useApi<Location[]>(
    (signal) =>
      fetchLocations({ signal, simulate: SIMULATIONS[simulation].simulate }),
    [simulation],
    { cancelStale, label: SIMULATIONS[simulation].label },
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
