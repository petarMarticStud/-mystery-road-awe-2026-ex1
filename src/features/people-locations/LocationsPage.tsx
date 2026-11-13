import { useEffect, useRef, useState } from "react";
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

  // Exercise 6 – Demo 7: nur fuer die Vorfuehrung. Ausgeschaltet zeigt es die Race Condition.
  const [cancelStale, setCancelStale] = useState(true);
  // Zaehlt die Anfragen, damit man in der Konsole sieht, welche Antwort zu welcher Anfrage gehoert.
  const requestCounter = useRef(0);

  useEffect(() => {
    // Exercise 6 – Demo 7: Jeder Effect-Durchlauf bekommt seinen EIGENEN AbortController.
    const controller = new AbortController();
    const requestId = ++requestCounter.current;
    const label = SIMULATIONS[simulation].label;

    // Jeder neue Ladevorgang beginnt wieder im Ladezustand.
    setState({ status: "loading" });

    async function loadLocations() {
      console.log(`[#${requestId}] Anfrage gestartet: ${label}`);
      try {
        const response = await fetch(
          `/api/locations${SIMULATIONS[simulation].query}`,
          // Mit signal kann der Browser die Anfrage abbrechen.
          { signal: cancelStale ? controller.signal : undefined },
        );

        if (!response.ok) {
          throw new Error(`The server answered with HTTP ${response.status}.`);
        }

        const data = (await response.json()) as Location[];
        console.log(`[#${requestId}] Antwort angezeigt: ${label} (${data.length} Orte)`);
        setState({ status: "success", data });
      } catch (error) {
        // Abgebrochen heisst: Diese Anfrage ist veraltet. Kein Fehler, nichts anzeigen.
        if (controller.signal.aborted) {
          console.log(`[#${requestId}] abgebrochen, Antwort ignoriert: ${label}`);
          return;
        }
        setState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Unknown network error.",
        });
      }
    }

    loadLocations();

    // Cleanup: React ruft das auf, BEVOR der Effect mit neuen Abhaengigkeiten
    // erneut laeuft (oder beim Unmount). Dann ist diese Anfrage veraltet.
    return () => {
      if (cancelStale) {
        console.log(`[#${requestId}] Cleanup: breche Anfrage ab (${label})`);
        controller.abort();
      }
    };
  }, [simulation, attempt, cancelStale]);

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
